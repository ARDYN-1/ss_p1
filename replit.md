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

## Gratitude storage setup

Gratitude entries use the existing FastAPI app and verified Clerk session. Set `AWS_REGION=ap-northeast-1` and `GRATITUDE_TABLE=SOULSPACE_Gratitude` in the deployment environment (see `.env.example`). Create the table in `ap-northeast-1` with string partition key `user_id`, string sort key `created_at`, and on-demand billing. Timestamps are UTC ISO-8601 strings and entries are queried newest first.

Add this least-privilege statement to the existing application IAM policy, replacing `<account-id>` with the AWS account ID:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:Query",
    "dynamodb:DeleteItem"
  ],
  "Resource": "arn:aws:dynamodb:ap-northeast-1:<account-id>:table/SOULSPACE_Gratitude"
}
```

`DeleteItem` supports the existing entry-removal control in the Gratitude history drawer. AWS access continues to use the standard boto3 credential chain or the deployment IAM role; never add credentials to source files.
