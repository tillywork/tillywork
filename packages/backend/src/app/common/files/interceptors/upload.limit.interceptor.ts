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
import { FilesService } from "../files.service";

@Injectable()
export class UploadLimitInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Project)
        private readonly projectsRepository: Repository<Project>,
        private filesService: FilesService
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async intercept(context: ExecutionContext, next: CallHandler<any>) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const file = request.file;

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const project = await this.projectsRepository.findOneByOrFail({
            id: user.project.id,
        });

        const userStorageUsage = await this.filesService.getUserStorageUsage(
            user.id
        );

        const newSize = +userStorageUsage + file.size;
        const limit = project.userUploadLimit;

        // Check if the new size exceeds the user's upload limit
        if (newSize >= limit) {
            throw new BadRequestException("UPLOAD_LIMIT_EXCEEDED");
        }

        // Continue with the request processing
        return next.handle();
    }
}
