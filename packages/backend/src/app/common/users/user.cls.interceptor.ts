import {
    Injectable,
    NestInterceptor,
    Inject,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { Observable } from "rxjs";

@Injectable()
export class UserClsInterceptor implements NestInterceptor {
    constructor(@Inject(ClsService) public cls: ClsService) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        this.cls.set("user", request.user);
        return next.handle();
    }
}
