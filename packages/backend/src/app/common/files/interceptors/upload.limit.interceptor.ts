import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "../../projects/project.entity";

@Injectable()
export class UploadLimitInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Project)
        private readonly projectsRepository: Repository<Project>
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async intercept(context: ExecutionContext, next: CallHandler<any>) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const file = request.file;

        if (!user) {
            throw new BadRequestException("User not found");
        }

        // Fetch the total size of uploaded files for the user
        const uploadedFiles = await this.projectsRepository.query(
            `SELECT SUM(size) as "totalSize" FROM file WHERE "createdById" = ${user.id} AND "deletedAt" IS NULL`
        );

        const totalUploadedSize = uploadedFiles[0]?.totalSize || 0;
        const newSize = +totalUploadedSize + file.size;

        // Check if the new size exceeds the user's upload limit
        if (newSize >= user.project.userUploadLimit) {
            throw new BadRequestException("UPLOAD_LIMIT_EXCEEDED");
        }

        // Continue with the request processing
        return next.handle();
    }
}
