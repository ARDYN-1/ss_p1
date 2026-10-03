# SoulSpace on Replit

## Project constraints

- Keep Clerk as the only authentication provider. Do not add a second login system or replace the existing Clerk session.
- Keep the homepage public; require the signed-in Clerk session for practice actions and the journal.
- Preserve the current UI. Make only the minimum visual changes needed for requested functionality.

## Run the app

The `Start application` workflow runs the FastAPI app on port 5000 and serves the existing static site alongside the API:

```sh
uvicorn backend.main:app --host 0.0.0.0 --port 5000
```

Install backend dependencies with:

```sh
pip install -r backend/requirements.txt
```

## Daily Journal setup

The journal API uses the Replit-managed Clerk app for sign-in and AWS DynamoDB for persistent storage. Clerk keys are managed through Replit's Auth pane and must never be hardcoded in the project.

Configure these AWS environment values before saving journals:

- `AWS_REGION`: the AWS region containing the DynamoDB table.
- `DYNAMODB_TABLE`: the table name.
- AWS credentials from the standard boto3 credential chain, preferably an IAM role or least-privilege credentials stored in Replit Secrets.

The DynamoDB table must use a string partition key named `user_id` and a string sort key named `date`. Each user's entries are isolated by the verified Clerk user ID; saving again on the same date replaces that user's entry for that date.

The AWS identity needs `dynamodb:PutItem`, `dynamodb:Query`, and `dynamodb:GetItem` permissions on this table. Never place AWS credentials in source files.