import { FileStorageType, IntegrationType } from "@tillywork/shared";
import Joi from "joi";

export const validationSchema = Joi.object({
    /** Environment */
    NODE_ENV: Joi.string()
        .valid("development", "production", "test")
        .default("development"),
    PORT: Joi.number().port().default(3000),

    /** Config */
    TW_FRONTEND_URL: Joi.string().required(),
    TW_SECRET_KEY: Joi.string().required(),
    TW_REDIS_HOST: Joi.string().required(),
    TW_REDIS_PORT: Joi.string().required(),
    TW_FILE_STORAGE_TYPE: Joi.string().default("local"),
    TW_CDN_URL: Joi.string().optional(),

    /** Database */
    TW_DB_NAME: Joi.string().required(),
    TW_DB_HOST: Joi.string().required(),
    TW_DB_PORT: Joi.number().default(5432),
    TW_DB_USERNAME: Joi.string().required(),
    TW_DB_PASSWORD: Joi.string().required(),
    TW_DB_ENABLE_SSL: Joi.boolean().default(false),

    /** Logging */
    TW_ENABLE_QUERY_LOGGING: Joi.boolean().default(false),
    TW_ENABLE_REQ_BODY_LOGGING: Joi.boolean().default(false),
    TW_OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().optional(),
    TW_OTEL_SERVICE_NAME: Joi.string().optional().default("tw-backend"),
    TW_GRAFANA_ADMIN_USER: Joi.string().optional(),
    TW_LOKI_HOST: Joi.string().optional(),

    /** Emails */
    TW_MAIL_ENABLE: Joi.boolean().default(false),
    TW_MAIL_HOST: Joi.when("TW_MAIL_ENABLE", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().allow("").optional(),
    }),
    TW_MAIL_PORT: Joi.when("TW_MAIL_ENABLE", {
        is: true,
        then: Joi.number().port().required(),
        otherwise: Joi.number().port().allow("").optional(),
    }),
    TW_MAIL_SECURE: Joi.when("TW_MAIL_ENABLE", {
        is: true,
        then: Joi.boolean().required(),
        otherwise: Joi.boolean().allow("").optional(),
    }),
    TW_MAIL_USER: Joi.when("TW_MAIL_ENABLE", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().allow("").optional(),
    }),
    TW_MAIL_PASS: Joi.when("TW_MAIL_ENABLE", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().allow("").optional(),
    }),

    /** AWS */
    TW_AWS_ACCESS_KEY_ID: Joi.string().allow("").optional(),
    TW_AWS_SECRET_ACCESS_KEY: Joi.string().allow("").optional(),
    TW_AWS_REGION: Joi.string().allow("").optional(),
    TW_AWS_S3_ENDPOINT: Joi.string().allow("").optional(),
    TW_AWS_S3_BUCKET: Joi.when("TW_FILE_STORAGE_TYPE", {
        is: FileStorageType.S3,
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
    }),

    /** Azure */
    TW_AZURE_CONNECTION_STRING: Joi.when("TW_FILE_STORAGE_TYPE", {
        is: FileStorageType.AZURE,
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
    }),
    TW_AZURE_CONTAINER_NAME: Joi.when("TW_FILE_STORAGE_TYPE", {
        is: FileStorageType.AZURE,
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
    }),

    /** Integrations */
    TW_ENABLED_INTEGRATIONS: Joi.string()
        .custom((value, helpers) => {
            if (!value) return value;
            const allowed = Object.values(IntegrationType);

            const integrations = value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);

            for (const i of integrations) {
                if (!allowed.includes(i)) {
                    return helpers.error("any.invalid");
                }
            }
            return value;
        }, "Comma-separated IntegrationType enum")
        .required()
        .allow(""),
    TW_REDIRECT_URL: Joi.string().required(),

    /** Slack */
    TW_SLACK_CLIENT_ID: Joi.when("TW_ENABLED_INTEGRATIONS", {
        is: Joi.string().pattern(/(^|,)slack($|,)/),
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
    }),
    TW_SLACK_CLIENT_SECRET: Joi.when("TW_ENABLED_INTEGRATIONS", {
        is: Joi.string().pattern(/(^|,)slack($|,)/),
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
    }),
});
