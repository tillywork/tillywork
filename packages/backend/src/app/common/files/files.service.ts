import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AWS from "aws-sdk";
import { TWFile } from "./file.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { FileDto, TWFileType } from "./types";

@Injectable()
export class FilesService {
    private readonly s3: AWS.S3;

    constructor(
        @InjectRepository(TWFile)
        private filesRepository: Repository<TWFile>,
        configService: ConfigService
    ) {
        this.s3 = new AWS.S3({
            accessKeyId: configService.get("TW_AWS_ACCESS_KEY_ID"),
            secretAccessKey: configService.get("TW_AWS_SECRET_ACCESS_KEY"),
            region: configService.get("TW_AWS_REGION"),
            endpoint: configService.get("TW_AWS_S3_ENDPOINT"),
            s3ForcePathStyle: true,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async uploadFileToS3({
        file,
        createdBy,
    }: {
        file: FileDto;
        createdBy: User;
    }): Promise<TWFile> {
        const fileNameWithTimestamp =
            Date.now().toString() + "-" + file.originalname;
        const uploadParams = {
            Bucket: "test",
            Key: fileNameWithTimestamp,
            Body: file.buffer,
        };

        const result = await this.s3.upload(uploadParams).promise();

        const fileEntity = this.filesRepository.create({
            name: file.originalname,
            url: result.Location,
            type: file.mimetype.startsWith("image")
                ? TWFileType.IMAGE
                : TWFileType.FILE,
            size: file.size,
            createdBy,
            project: {
                id: createdBy.project.id,
            },
        });

        await this.filesRepository.save(fileEntity);

        return fileEntity;
    }

    async getUserStorageUsage(userId: number): Promise<number> {
        return this.filesRepository.sum("size", {
            createdBy: {
                id: userId,
            },
        });
    }
}
