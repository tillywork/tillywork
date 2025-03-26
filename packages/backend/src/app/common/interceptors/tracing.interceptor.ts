import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { trace, SpanStatusCode, context } from "@opentelemetry/api";
import { FastifyRequest, FastifyReply } from "fastify";
import { TillyLogger } from "../logger/tilly.logger";

@Injectable()
export class TracingInterceptor implements NestInterceptor {
    private logger = new TillyLogger("HTTP");

    intercept(
        executionContext: ExecutionContext,
        next: CallHandler
    ): Observable<any> {
        const ctx = executionContext.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse<FastifyReply>();
        const startTime = process.hrtime();

        // Log the request
        this.logHttpRequest(request);

        const tracer = trace.getTracer(
            process.env.TW_OTEL_SERVICE_NAME || "tw-backend"
        );
        const span = tracer.startSpan(
            `${executionContext.getClass().name}.${
                executionContext.getHandler().name
            }`
        );

        return context.with(trace.setSpan(context.active(), span), () => {
            return next.handle().pipe(
                tap({
                    next: () => {
                        span.setStatus({ code: SpanStatusCode.OK });
                        span.end();
                    },
                    error: (error) => {
                        const responseTime = process.hrtime(startTime);
                        const responseTimeMs =
                            responseTime[0] * 1000 + responseTime[1] / 1e6;

                        this.logHttpError(
                            request,
                            response,
                            responseTimeMs,
                            error
                        );

                        span.setStatus({
                            code: SpanStatusCode.ERROR,
                            message: error.message,
                        });
                        span.recordException(error);
                        span.end();
                    },
                })
            );
        });
    }

    private logHttpRequest(request: FastifyRequest) {
        const message = `${request.id} - ${request.method} ${request.url}`;
        this.logger.log(message);

        if (
            process.env.NODE_ENV !== "production" &&
            process.env.TW_ENABLE_REQ_BODY_LOGGING !== "false" &&
            request.body
        ) {
            this.logger.log(JSON.stringify(request.body));
        }
    }

    private logHttpError(
        request: FastifyRequest,
        response: FastifyReply,
        responseTimeMs: number,
        error: Error
    ) {
        const message = `${request.id} - ${request.method} ${request.url} - ${
            response.statusCode || 500
        } - ${responseTimeMs.toFixed(2)}ms`;

        this.logger.error(message, error.stack);
    }
}
