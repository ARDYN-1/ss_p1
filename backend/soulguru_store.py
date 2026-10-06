"""DynamoDB operations for SoulGuru conversations."""

from __future__ import annotations

from typing import Any

from boto3.dynamodb.conditions import Key
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError, PartialCredentialsError
from fastapi import HTTPException


class SoulGuruStore:
    def __init__(self, table: Any):
        self.table = table

    def get(self, user_id: str, conversation_id: str) -> dict[str, Any] | None:
        result = self.table.get_item(Key={"user_id": user_id, "conversation_id": conversation_id})
        return result.get("Item")

    def save(self, conversation: dict[str, Any]) -> None:
        self.table.put_item(Item=conversation)

    def list_for_user(self, user_id: str, limit: int = 100) -> list[dict[str, Any]]:
        query_args: dict[str, Any] = {
            "KeyConditionExpression": Key("user_id").eq(user_id),
            "ProjectionExpression": "conversation_id, title, created_at, updated_at, message_count",
            "ScanIndexForward": False,
            "Limit": limit,
        }
        items: list[dict[str, Any]] = []
        while len(items) < limit:
            result = self.table.query(**query_args)
            items.extend(result.get("Items", []))
            last_key = result.get("LastEvaluatedKey")
            if not last_key:
                break
            query_args["ExclusiveStartKey"] = last_key
        items.sort(key=lambda item: item.get("updated_at", ""), reverse=True)
        return items[:limit]

    def delete(self, user_id: str, conversation_id: str) -> None:
        self.table.delete_item(
            Key={"user_id": user_id, "conversation_id": conversation_id},
            ConditionExpression="attribute_exists(conversation_id)",
        )


def storage_error(error: Exception) -> HTTPException:
    if isinstance(error, ClientError):
        code = error.response.get("Error", {}).get("Code", "Unknown")
        if code == "ResourceNotFoundException":
            detail = "SoulGuru history storage is not available yet."
        elif code in {"AccessDeniedException", "AccessDenied", "UnauthorizedOperation"}:
            detail = "SoulGuru history storage is not configured correctly."
        elif code == "ConditionalCheckFailedException":
            return HTTPException(status_code=404, detail="Conversation not found.")
        else:
            detail = "SoulGuru history is temporarily unavailable. Please try again."
    elif isinstance(error, (NoCredentialsError, PartialCredentialsError, BotoCoreError)):
        detail = "SoulGuru history is temporarily unavailable. Please try again."
    else:
        detail = "SoulGuru history is temporarily unavailable. Please try again."
    return HTTPException(status_code=503, detail=detail)
