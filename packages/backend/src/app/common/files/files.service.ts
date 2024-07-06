import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TWFile } from "./file.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { FileDto, TWFileType } from "./types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { CreateFileDto } from "./dtos/create.file.dto";
import { UpdateFileDto } from "./dtos/update.file.dto";

@Injectable()
export class FilesService {
    private readonly s3: S3Client;
    private readonly bucket: string;
    private readonly endpoint: string;
    private readonly cdnUrl: string;
    private readonly storageType: string;
    private readonly localStoragePath: string = "uploads";
    private readonly configService: ConfigService;

    constructor(
        @InjectRepository(TWFile)
        private filesRepository: Repository<TWFile>,
        configService: ConfigService
    ) {
        this.configService = configService;
        this.endpoint = configService.get("TW_AWS_S3_ENDPOINT");
        this.storageType = configService.get("TW_FILE_STORAGE_TYPE");
        this.cdnUrl = configService.get("TW_CDN_URL");

        if (this.storageType === "s3") {
            this.s3 = new S3Client({
                region: configService.get("TW_AWS_REGION"),
                credentials: {
                    accessKeyId: configService.get("TW_AWS_ACCESS_KEY_ID"),
                    secretAccessKey: configService.get(
                        "TW_AWS_SECRET_ACCESS_KEY"
                    ),
                },
                endpoint: this.endpoint !== "" ? this.endpoint : undefined,
                forcePathStyle: this.endpoint !== "" ? true : false,
            });
            this.bucket = configService.get("TW_AWS_S3_BUCKET");
        }
    }

    async uploadFile({
        file,
        createdBy,
    }: {
        file: FileDto;
        createdBy: User;
    }): Promise<TWFile> {
        if (this.storageType === "s3") {
            return this.uploadFileToS3({ file, createdBy });
        } else {
            return this.uploadFileToLocal({ file, createdBy });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async uploadFileToS3({
        file,
        createdBy,
    }: {
        file: FileDto;
        createdBy: User;
    }): Promise<TWFile> {
        const fileNameWithTimestamp = this.prependTimestampToFilename(
            file.originalname
        );

        const uploadParams = {
            Bucket: this.bucket,
            Key: `${this.localStoragePath}/${fileNameWithTimestamp}`,
            Body: file.buffer,
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        await this.s3.send(uploadCommand);

        return this.create({
            name: file.originalname,
            key: fileNameWithTimestamp,
            url: this.getFullFileUrl(fileNameWithTimestamp),
            type: file.mimetype.startsWith("image")
                ? TWFileType.IMAGE
                : TWFileType.FILE,
            size: file.size,
            createdBy,
            projectId: createdBy.project.id,
        });
    }

    async uploadFileToLocal({
        file,
        createdBy,
    }: {
        file: FileDto;
        createdBy: User;
    }): Promise<TWFile> {
        const fileNameWithTimestamp = this.prependTimestampToFilename(
            file.originalname
        );

        const filePath = path.join(
            this.localStoragePath,
            fileNameWithTimestamp
        );

        // Ensure the directory exists
        await fs.promises.mkdir(this.localStoragePath, { recursive: true });

        // Save the file to the local file system
        await fs.promises.writeFile(filePath, file.buffer);

        const createdFile = await this.create({
            name: file.originalname,
            key: fileNameWithTimestamp,
            type: file.mimetype.startsWith("image")
                ? TWFileType.IMAGE
                : TWFileType.FILE,
            size: file.size,
            createdBy,
            projectId: createdBy.project.id,
        });

        return this.update(createdFile.id, {
            url: this.getFullFileUrl(createdFile.id),
        });
    }

    async getUserStorageUsage(userId: number): Promise<number> {
        return this.filesRepository.sum("size", {
            createdBy: {
                id: userId,
            },
        });
    }

    /**
     * Returns the URL to the file depending
     * on project setup. We use the TW_CDN_URL
     * env variable as the default link to the
     * S3 bucket if we're not using a custom endpoint.
     * @param fileName The key of the file uploaded
     * @returns The full URL to the file or the file name if no custom endpoint and no TW_CDN_URL.
     */
    getFullFileUrl(fileName: string) {
        if (this.storageType === "s3") {
            if (this.endpoint !== "") {
                return `${this.endpoint}/${this.bucket}/${
                    this.localStoragePath
                }/${encodeURI(fileName)}`;
            } else if (this.cdnUrl) {
                return `${this.cdnUrl}/${this.localStoragePath}/${encodeURI(
                    fileName
                )}`;
            } else {
                return encodeURI(fileName);
            }
        } else {
            return `${this.configService.get(
                "TW_VITE_API_URL"
            )}/files/${encodeURI(fileName)}`;
        }
    }

    getLocalStoragePath() {
        return this.localStoragePath;
    }

    prependTimestampToFilename(fileName: string) {
        return Date.now().toString() + "-" + fileName;
    }

    findOne({ id, projectId }: { id: string; projectId?: number }) {
        return this.filesRepository.findOneBy({
            id,
            project: {
                id: projectId,
            },
        });
    }

    async findOneOrFail({ id, projectId }: { id: string; projectId?: number }) {
        const file = await this.filesRepository.findOneBy({
            id,
            project: {
                id: projectId,
            },
        });

        if (!file) {
            throw new NotFoundException("File not found");
        }

        return file;
    }

    findOneByKey({ key, projectId }: { key: string; projectId?: number }) {
        return this.filesRepository.findOneBy({
            key,
            project: {
                id: projectId,
            },
        });
    }

    async create(createFileDto: CreateFileDto) {
        const fileEntity = this.filesRepository.create({
            ...createFileDto,
            project: {
                id: createFileDto.projectId,
            },
        });

        await this.filesRepository.save(fileEntity);

        return fileEntity;
    }

    async update(id: string, updateFileDto: UpdateFileDto) {
        const file = await this.findOne({ id });
        this.filesRepository.merge(file, updateFileDto);
        return this.filesRepository.save(file);
    }
}
