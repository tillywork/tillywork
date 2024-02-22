import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse();

    const { method, url } = request;
    const startTime = process.hrtime();

    return next.handle().pipe(
      tap(() => {
        const responseTime = process.hrtime(startTime);
        const responseTimeMs = responseTime[0] * 1000 + responseTime[1] / 1e6;
        const status = response.statusCode;

        this.logger.log(
          `${method} ${url} - ${status} - ${responseTimeMs.toFixed(2)}ms`
        );
      })
    );
  }
}
