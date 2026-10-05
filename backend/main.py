import logging
import os
from datetime import date as date_type
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import boto3
import httpx
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError, PartialCredentialsError
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.responses import Response
from boto3.dynamodb.conditions import Key


PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("soulspace.journal")
CLERK_FAPI = "https://frontend-api.clerk.dev"
CLERK_PROXY_PATH = "/api/__clerk"
MAX_ENTRY_BYTES = 350_000
PUBLIC_FILES = {
    "index.html",
    "journal.html",
    "journal.css",
    "journal.js",
    "sign-in.html",
    "sign-up.html",
    "auth.js",
    "styles.css",
    "script.js",
    "weekly-activity-data.js",
}
PUBLIC_ASSET_DIRS = {"assets", "activities_assets"}
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}

app = FastAPI(title="SoulSpace Journal API", docs_url=None, redoc_url=None, openapi_url=None)


class JournalInput(BaseModel):
    date: date_type
    content: str


@lru_cache(maxsize=2)
def _dynamodb_resource(region: str) -> Any:
    return boto3.resource("dynamodb", region_name=region)


def _journal_table():
    table_name = os.getenv("DYNAMODB_TABLE")
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    if not table_name or not region:
        raise HTTPException(
            status_code=503,
            detail="Journal storage is not configured. Set AWS_REGION and DYNAMODB_TABLE, and provide AWS credentials or an IAM role.",
        )
    return _dynamodb_resource(region).Table(table_name)


def _dynamo_error(error: Exception) -> HTTPException:
    if isinstance(error, ClientError):
        code = error.response.get("Error", {}).get("Code", "Unknown")
        if code == "ResourceNotFoundException":
            return HTTPException(status_code=503, detail="The configured DynamoDB journal table was not found.")
        if code in {"AccessDeniedException", "AccessDenied", "UnauthorizedOperation"}:
            return HTTPException(status_code=503, detail="AWS credentials do not have permission to access the journal table.")
        if code == "ValidationException":
            return HTTPException(
                status_code=503,
                detail="The DynamoDB table must use a string user_id partition key and a string date sort key.",
            )
        logger.error("DynamoDB request failed with %s.", code)
        return HTTPException(status_code=503, detail="Journal storage is temporarily unavailable.")
    if isinstance(error, (NoCredentialsError, PartialCredentialsError)):
        return HTTPException(status_code=503, detail="AWS credentials are not configured for journal storage.")
    if isinstance(error, BotoCoreError):
        logger.error("DynamoDB request could not be completed (%s).", type(error).__name__)
        return HTTPException(status_code=503, detail="Journal storage is temporarily unavailable.")
    logger.error("Unexpected journal storage failure (%s).", type(error).__name__)
    return HTTPException(status_code=503, detail="Journal storage is temporarily unavailable.")


def _public_origin(request: Request) -> str:
    origin = request.headers.get("origin")
    if origin:
        parsed_origin = urlsplit(origin)
        if parsed_origin.scheme in {"http", "https"} and parsed_origin.netloc:
            return f"{parsed_origin.scheme}://{parsed_origin.netloc}"

    referer = request.headers.get("referer")
    if referer:
        parsed_referer = urlsplit(referer)
        if parsed_referer.scheme in {"http", "https"} and parsed_referer.netloc:
            return f"{parsed_referer.scheme}://{parsed_referer.netloc}"

    forwarded_host = request.headers.get("x-forwarded-host", "")
    host = (forwarded_host.split(",", 1)[0].strip() or request.headers.get("host", "")).strip()
    forwarded_proto = request.headers.get("x-forwarded-proto", "")
    scheme = forwarded_proto.split(",", 1)[0].strip() or request.url.scheme
    if not host:
        raise HTTPException(status_code=401, detail="Sign in to access your journal.")
    return f"{scheme}://{host}"


@lru_cache(maxsize=1)
def _clerk_client(secret_key: str) -> Clerk:
    return Clerk(bearer_auth=secret_key)


def require_user_id(request: Request) -> str:
    secret_key = os.getenv("CLERK_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=503, detail="Sign-in is not configured.")

    try:
        clerk_request = httpx.Request(
            method=request.method,
            url=str(request.url),
            headers=dict(request.headers),
        )
        state = _clerk_client(secret_key).authenticate_request(
            clerk_request,
            AuthenticateRequestOptions(authorized_parties=[_public_origin(request)]),
        )
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Clerk could not verify an incoming session (%s).", type(error).__name__)
        raise HTTPException(status_code=503, detail="Sign-in verification is temporarily unavailable.") from None

    if not state.is_signed_in:
        raise HTTPException(status_code=401, detail="Sign in to access your journal.")
    payload = state.payload or {}
    user_id = payload.get("sub") if isinstance(payload, dict) else getattr(payload, "sub", None)
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(status_code=401, detail="Sign in to access your journal.")
    return user_id


@app.get("/api/auth/config")
def auth_config():
    publishable_key = os.getenv("CLERK_PUBLISHABLE_KEY") or os.getenv("VITE_CLERK_PUBLISHABLE_KEY")
    if not publishable_key:
        raise HTTPException(status_code=503, detail="Sign-in is not configured.")

    proxy_url = os.getenv("VITE_CLERK_PROXY_URL")
    return {"publishableKey": publishable_key, "proxyUrl": proxy_url}


@app.post("/api/journals/")
def save_journal(body: JournalInput, user_id: str = Depends(require_user_id)):
    if not body.content.strip():
        raise HTTPException(status_code=422, detail="Write a little something before saving.")
    if len(body.content.encode("utf-8")) > MAX_ENTRY_BYTES:
        raise HTTPException(status_code=413, detail="This journal entry is too long to save.")

    entry_date = body.date.isoformat()
    try:
        _journal_table().put_item(
            Item={
                "user_id": user_id,
                "date": entry_date,
                "content": body.content,
            }
        )
    except (ClientError, BotoCoreError, NoCredentialsError, PartialCredentialsError) as error:
        raise _dynamo_error(error) from None

    return {"date": entry_date, "content": body.content, "message": "Your journal has been saved."}


@app.get("/api/journals/")
def list_journals(user_id: str = Depends(require_user_id)):
    try:
        table = _journal_table()
        query_args = {
            "KeyConditionExpression": Key("user_id").eq(user_id),
            "ScanIndexForward": False,
            "ProjectionExpression": "#entry_date, content",
            "ExpressionAttributeNames": {"#entry_date": "date"},
        }
        entries = []
        while True:
            result = table.query(**query_args)
            entries.extend(result.get("Items", []))
            last_key = result.get("LastEvaluatedKey")
            if not last_key:
                break
            query_args["ExclusiveStartKey"] = last_key
    except (ClientError, BotoCoreError, NoCredentialsError, PartialCredentialsError) as error:
        raise _dynamo_error(error) from None

    journals = []
    for entry in entries:
        content = entry.get("content", "")
        preview = " ".join(content.split())
        journals.append({"date": entry["date"], "preview": preview[:180]})
    journals.sort(key=lambda entry: entry["date"], reverse=True)
    return {"journals": journals}


@app.get("/api/journals/{entry_date}")
def get_journal(entry_date: date_type, user_id: str = Depends(require_user_id)):
    try:
        result = _journal_table().get_item(
            Key={"user_id": user_id, "date": entry_date.isoformat()},
            ConsistentRead=True,
        )
    except (ClientError, BotoCoreError, NoCredentialsError, PartialCredentialsError) as error:
        raise _dynamo_error(error) from None

    entry = result.get("Item")
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    return {"date": entry["date"], "content": entry["content"]}


@app.api_route(
    f"{CLERK_PROXY_PATH}/{{path:path}}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
@app.api_route(CLERK_PROXY_PATH, methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def clerk_frontend_api_proxy(request: Request, path: str = ""):
    secret_key = os.getenv("CLERK_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=503, detail="Sign-in is not configured.")

    upstream_url = f"{CLERK_FAPI}/{path.lstrip('/')}"
    if request.url.query:
        upstream_url = f"{upstream_url}?{request.url.query}"

    headers = dict(request.headers)
    for header in (*HOP_BY_HOP_HEADERS, "host", "content-length"):
        headers.pop(header, None)

    forwarded_host = request.headers.get("x-forwarded-host", "")
    host = (forwarded_host.split(",", 1)[0].strip() or request.headers.get("host", "")).strip()
    forwarded_proto = request.headers.get("x-forwarded-proto", "")
    protocol = forwarded_proto.split(",", 1)[0].strip() or "https"
    headers["Clerk-Proxy-Url"] = f"{protocol}://{host}{CLERK_PROXY_PATH}"
    headers["Clerk-Secret-Key"] = secret_key
    client_ip = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
    if not client_ip and request.client:
        client_ip = request.client.host
    if client_ip:
        headers["X-Forwarded-For"] = client_ip

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=False) as client:
            async with client.stream(
                request.method,
                upstream_url,
                headers=headers,
                content=await request.body(),
            ) as upstream:
                response_status = upstream.status_code
                response_body = b"".join([chunk async for chunk in upstream.aiter_raw()])
                response_headers = list(upstream.headers.multi_items())
    except httpx.HTTPError as error:
        logger.error("Clerk Frontend API proxy failed (%s).", type(error).__name__)
        return Response(status_code=502, content=b"")

    response = Response(content=response_body, status_code=response_status)
    raw_headers = [
        (name.lower().encode("latin-1"), value.encode("latin-1"))
        for name, value in response_headers
        if name.lower() not in HOP_BY_HOP_HEADERS
    ]
    if not any(name == b"content-length" for name, _ in raw_headers) and response_status not in {204, 304} and response_status >= 200:
        raw_headers.append((b"content-length", str(len(response_body)).encode("ascii")))
    response.raw_headers = raw_headers
    return response


@app.middleware("http")
async def limit_public_files(request: Request, call_next):
    path = request.url.path.lstrip("/")
    parts = Path(path).parts
    is_public_asset = (
        len(parts) > 1
        and parts[0] in PUBLIC_ASSET_DIRS
        and all(part not in {".", ".."} and not part.startswith(".") for part in parts)
    )
    if not path.startswith("api/") and path not in PUBLIC_FILES and path != "" and not is_public_asset:
        return Response(status_code=404)
    return await call_next(request)


app.mount("/", StaticFiles(directory=PROJECT_ROOT, html=True), name="site")
