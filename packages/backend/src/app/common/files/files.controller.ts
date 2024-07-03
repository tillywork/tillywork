import {
    Controller,
    Post,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { FileInterceptor } from "@nest-lab/fastify-multer";
import { FileDto } from "./types";

@ApiBearerAuth()
@ApiTags("files")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "files",
    version: "1",
})
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @UseInterceptors(FileInterceptor("file"))
    @Post()
    async uploadFile(@Request() req, @UploadedFile() file: FileDto) {
        const { user } = req;
        return this.filesService.uploadFileToS3({
            file,
            createdBy: user,
        });
    }
}
