import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TWFile } from "./file.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StorageAdapter } from "./adapters/storage.adapter";
import { S3StorageAdapter } from "./adapters/s3.storage.adapter";
import { LocalStorageAdapter } from "./adapters/local.storage.adapter";
import { FileDto, TWFileType } from "./types";
import { User } from "../users/user.entity";
import { CreateFileDto } from "./dtos/create.file.dto";
import { FileStorageType } from "@tillywork/shared";
import { UpdateFileDto } from "./dtos/update.file.dto";
import { join } from "path";
import { AzureStorageAdapter } from "./adapters/azure.storage.adapter";

@Injectable()
export class FilesService {
    private readonly storageAdapter: StorageAdapter;

    constructor(
        @InjectRepository(TWFile)
        private filesRepository: Repository<TWFile>,
        private readonly configService: ConfigService
    ) {
        const storageType = configService.get("TW_FILE_STORAGE_TYPE");
        const localStoragePath = "uploads";

        switch (storageType) {
            case FileStorageType.S3:
                this.storageAdapter = new S3StorageAdapter({
                    region: configService.get("TW_AWS_REGION"),
                    accessKeyId: configService.get("TW_AWS_ACCESS_KEY_ID"),
                    secretAccessKey: configService.get(
                        "TW_AWS_SECRET_ACCESS_KEY"
                    ),
                    bucket: configService.get("TW_AWS_S3_BUCKET"),
                    endpoint: configService.get("TW_AWS_S3_ENDPOINT"),
                    localStoragePath,
                    cdnUrl: configService.get("TW_CDN_URL"),
                });
                break;

            case FileStorageType.AZURE:
                this.storageAdapter = new AzureStorageAdapter({
                    connectionString: configService.get(
                        "TW_AZURE_CONNECTION_STRING"
                    ),
                    containerName: configService.get("TW_AZURE_CONTAINER_NAME"),
                    localStoragePath,
                    cdnUrl: configService.get("TW_CDN_URL"),
                });
                break;

            case FileStorageType.LOCAL:
            default:
                this.storageAdapter = new LocalStorageAdapter({
                    storagePath: localStoragePath,
                    apiUrl: configService.get("TW_VITE_API_URL"),
                });
                break;
        }
    }

    async uploadFile({
        file,
        createdBy,
    }: {
        file: FileDto;
        createdBy: User;
    }): Promise<TWFile> {
        const fileNameWithTimestamp = this.prependTimestampToFilename(
            file.originalname
        );

        const key = await this.storageAdapter.uploadFile(
            file,
            fileNameWithTimestamp
        );

        const createdFile = await this.create({
            name: file.originalname,
            key,
            type: file.mimetype.startsWith("image")
                ? TWFileType.IMAGE
                : TWFileType.FILE,
            size: file.size,
            createdBy,
            projectId: createdBy.project.id,
        });

        return this.update(createdFile.id, {
            url: this.storageAdapter.getFileUrl(createdFile),
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
     * Get the local storage path for files.
     * @returns {string} The absolute path to the local file storage directory.
     */
    getLocalStoragePath(): string {
        return join(process.cwd(), "uploads");
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

    async create(createFileDto: CreateFileDto): Promise<TWFile> {
        const fileEntity = this.filesRepository.create({
            ...createFileDto,
            project: { id: createFileDto.projectId },
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
