import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { Observable } from "rxjs";
import { from } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger("HTTP");

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> | Promise<Observable<unknown>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse<FastifyReply>();

        const { body } = request;
        const startTime = process.hrtime();

        if (process.env.NODE_ENV !== "production") {
            if (process.env.TW_ENABLE_REQ_BODY_LOGGING !== "false" && body) {
                this.logger.log(body);
            }
        }

        return next
            .handle()
            .pipe()
            .toPromise()
            .then((result) => {
                this.logResponse(request, response, startTime);
                return result;
            })
            .catch((error) => {
                this.logError(request, response, startTime, error);
                throw error; // Rethrow the error to be handled by Nest's global filters
            })
            .then((result) => from(Promise.resolve(result))); // Convert the resulting promise back to an Observable
    }

    private logResponse(
        request: FastifyRequest,
        response: FastifyReply,
        startTime: [number, number]
    ) {
        const responseTime = process.hrtime(startTime);
        const responseTimeMs = responseTime[0] * 1000 + responseTime[1] / 1e6;

        this.logger.log(
            `${request.id} - ${request.method} ${request.url} - ${
                response.statusCode
            } - ${responseTimeMs.toFixed(2)}ms`
        );
    }

    private logError(
        request: FastifyRequest,
        response: FastifyReply,
        startTime: [number, number],
        error: Error
    ) {
        const responseTime = process.hrtime(startTime);
        const responseTimeMs = responseTime[0] * 1000 + responseTime[1] / 1e6;

        this.logger.error(
            `${request.id} - ${request.method} ${request.url} - ${
                response.statusCode || 500
            } - ${responseTimeMs.toFixed(2)}ms`,
            `Error: ${error.message}`
        );
    }
}
