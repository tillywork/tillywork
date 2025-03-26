import { ConsoleLogger, LoggerService } from "@nestjs/common";
import { createLogger, format } from "winston";
import LokiTransport from "winston-loki";
import { trace, context } from "@opentelemetry/api";

export class TillyLogger extends ConsoleLogger implements LoggerService {
    private winstonLogger;
    private readonly sensitiveKeys = [
        "password",
        "token",
        "authorization",
        "secret",
        "key",
        "apiKey",
        "credit_card",
        "email",
    ];

    private sanitizeData(data: any): any {
        if (!data) return data;

        if (typeof data === "object") {
            const sanitized = { ...data };
            for (const key of Object.keys(sanitized)) {
                if (
                    this.sensitiveKeys.some((sensitive) =>
                        key.toLowerCase().includes(sensitive.toLowerCase())
                    )
                ) {
                    sanitized[key] = "[REDACTED]";
                } else if (typeof sanitized[key] === "object") {
                    sanitized[key] = this.sanitizeData(sanitized[key]);
                }
            }
            return sanitized;
        }

        return data;
    }

    constructor(context?: string) {
        super(context);

        const transportsList = [];

        // Only add Loki transport if host is configured
        if (process.env.TW_LOKI_HOST) {
            transportsList.push(
                new LokiTransport({
                    host: process.env.TW_LOKI_HOST,
                    labels: {
                        app: process.env.TW_OTEL_SERVICE_NAME || "tw-backend",
                        context: context || "APP",
                        environment: process.env.NODE_ENV || "development",
                    },
                    json: true,
                    replaceTimestamp: true,
                    onConnectionError: (err: Error) => {
                        super.warn(`Loki connection error: ${err.message}`);
                    },
                })
            );

            this.winstonLogger = createLogger({
                level: "debug",
                format: format.combine(
                    format.timestamp(),
                    format.json(),
                    format((info) => {
                        info.message = this.sanitizeData(info.message);
                        return info;
                    })()
                ),
                transports: transportsList,
            });
        }
    }

    log(message: any, context?: string) {
        const sanitizedMessage = this.sanitizeData(message);
        context = context || this.context;
        super.log(sanitizedMessage, context);

        if (this.winstonLogger) {
            this.winstonLogger.info({ message: sanitizedMessage, context });
        }
    }

    error(message: any, stack?: string, logContext?: string) {
        logContext = logContext || this.context;
        super.error(message, stack, logContext);

        const span = trace.getSpan(context.active());
        if (span) {
            span.addEvent("error", {
                message,
                stack,
                context: logContext,
                level: "error",
            });
        }

        if (this.winstonLogger) {
            this.winstonLogger.error({ message, stack, context: logContext });
        }
    }

    warn(message: any, logContext?: string) {
        logContext = logContext || this.context;
        super.warn(message, logContext);

        const span = trace.getSpan(context.active());
        if (span) {
            span.addEvent("warn", {
                message,
                context: logContext,
                level: "warn",
            });
        }

        if (this.winstonLogger) {
            this.winstonLogger.warn({ message, context: logContext });
        }
    }

    debug(message: any, logContext?: string) {
        const sanitizedMessage = this.sanitizeData(message);
        logContext = logContext || this.context;
        super.debug(sanitizedMessage, logContext);

        const span = trace.getSpan(context.active());
        if (span) {
            span.addEvent("debug", {
                message: sanitizedMessage,
                context: logContext,
                level: "debug",
            });
        }

        if (this.winstonLogger) {
            this.winstonLogger.debug({
                message: sanitizedMessage,
                context: logContext,
                level: "debug",
            });
        }
    }

    verbose(message: any, logContext?: string) {
        logContext = logContext || this.context;
        super.verbose(message, logContext);

        const span = trace.getSpan(context.active());
        if (span) {
            span.addEvent("verbose", {
                message,
                context: logContext,
                level: "verbose",
            });
        }

        if (this.winstonLogger) {
            this.winstonLogger.verbose({ message, context: logContext });
        }
    }
}
