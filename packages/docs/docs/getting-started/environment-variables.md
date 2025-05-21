# Environment Variables

This page lists and explains the environment variables used by the backend service. These variables configure the database, mail, file storage, and other core features.

---

## General

| Variable        | Description                                               | Default     | Required |
| --------------- | --------------------------------------------------------- | ----------- | -------- |
| `NODE_ENV`      | Node.js environment (`development`, `production`, `test`) | development | No       |
| `PORT`          | Port the backend server runs on                           | 3000        | No       |
| `TW_SECRET_KEY` | Secret key for encryption/authentication                  | —           | Yes      |

## Database

| Variable           | Description                        | Default | Required |
| ------------------ | ---------------------------------- | ------- | -------- |
| `TW_DB_NAME`       | Database name                      | —       | Yes      |
| `TW_DB_HOST`       | Database host                      | —       | Yes      |
| `TW_DB_PORT`       | Database port                      | 5432    | No       |
| `TW_DB_USERNAME`   | Database username                  | —       | Yes      |
| `TW_DB_PASSWORD`   | Database password                  | —       | Yes      |
| `TW_DB_ENABLE_SSL` | Enable SSL for database connection | false   | No       |

## Logging

| Variable                     | Description                  | Default | Required |
| ---------------------------- | ---------------------------- | ------- | -------- |
| `TW_ENABLE_QUERY_LOGGING`    | Enable Typeorm query logging | false   | No       |
| `TW_ENABLE_REQ_BODY_LOGGING` | Enable request body logging  | false   | No       |

## Email

| Variable         | Description                  | Required if `TW_MAIL_ENABLE=true` |
| ---------------- | ---------------------------- | --------------------------------- |
| `TW_MAIL_ENABLE` | Enable mail sending          | No                                |
| `TW_MAIL_HOST`   | SMTP host                    | Yes                               |
| `TW_MAIL_PORT`   | SMTP port                    | Yes                               |
| `TW_MAIL_SECURE` | Use secure SMTP (true/false) | Yes                               |
| `TW_MAIL_USER`   | SMTP username                | Yes                               |
| `TW_MAIL_PASS`   | SMTP password                | Yes                               |

## Redis

| Variable        | Description | Default | Required |
| --------------- | ----------- | ------- | -------- |
| `TW_REDIS_HOST` | Redis host  | redis   | Yes      |
| `TW_REDIS_PORT` | Redis port  | 6379    | Yes      |

## File Storage

| Variable               | Description                                | Default | Required |
| ---------------------- | ------------------------------------------ | ------- | -------- |
| `TW_FILE_STORAGE_TYPE` | File storage type (`local`, `s3`, `azure`) | local   | No       |

### AWS S3

| Variable                   | Description                                      | Required |
| -------------------------- | ------------------------------------------------ | -------- |
| `TW_AWS_ACCESS_KEY_ID`     | AWS access key ID                                | Yes      |
| `TW_AWS_SECRET_ACCESS_KEY` | AWS secret access key                            | Yes      |
| `TW_AWS_REGION`            | AWS region                                       | Yes      |
| `TW_AWS_S3_ENDPOINT`       | AWS S3 endpoint (optional, for custom endpoints) | No       |
| `TW_AWS_S3_BUCKET`         | S3 bucket name                                   | Yes      |

### Azure Blob Storage

| Variable                     | Description                     | Required |
| ---------------------------- | ------------------------------- | -------- |
| `TW_AZURE_CONNECTION_STRING` | Azure storage connection string | Yes      |
| `TW_AZURE_CONTAINER_NAME`    | Azure container name            | Yes      |

## Integrations

Used to enable integrations in tillywork.

| Variable                  | Description                                                                                         | Required |
| ------------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| `TW_ENABLED_INTEGRATIONS` | A comma separated string of enabled integrations. E.g `TW_ENABLED_INTEGRATIONS=slack,gmail,hubspot` | Yes      |
| `TW_REDIRECT_URL`         | Default is `http://localhost:3000/v1/user-integrations/redirect`                                    | Yes      |

## Slack

Used to enable Slack functionality.

| Variable                 | Description                          | Required |
| ------------------------ | ------------------------------------ | -------- |
| `TW_SLACK_CLIENT_ID`     | The client ID for your Slack app     | Yes      |
| `TW_SLACK_CLIENT_SECRET` | The client secret for your Slack app | Yes      |

## CDN

| Variable     | Description                    | Required |
| ------------ | ------------------------------ | -------- |
| `TW_CDN_URL` | CDN base URL for serving files | No       |

## Logging and Observability

For logging and observability environment variables, we have [a dedicated documentation page](/observability/logging) with all the information you need.

## Frontend

Any frontend environment variable is prefixed with `TW_VITE_`, e.g `TW_VITE_API_URL`.

| Variable                             | Description                           | Default                  | Required |
| ------------------------------------ | ------------------------------------- | ------------------------ | -------- |
| `TW_VITE_API_URL`                    | The URL to the tillywork API          | http://localhost:3000/v1 | No       |
| `TW_VITE_DOCS_URL`                   | URL to tillywork documentation        | https://docs.tilly.work  | No       |
| `TW_VITE_POSTHOG_KEY`                | The Posthog project key for analytics |                          | No       |
| `TW_VITE_PASSWORD_VALIDATION_POLICY` | Password Validation policy            | none                     | No       |

---

**Note:** Some variables are only required if certain features are enabled (e.g., mail, S3, Azure). See the table notes for details.
