import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { StorageAdapter } from "./storage.adapter";
import { FileDto } from "../types";
import { TWFile } from "../file.entity";

export class S3StorageAdapter implements StorageAdapter {
    private readonly s3: S3Client;
    private readonly bucket: string;
    private readonly localStoragePath: string;
    private readonly cdnUrl: string;

    constructor(config: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        endpoint?: string;
        localStoragePath: string;
        cdnUrl?: string;
    }) {
        this.s3 = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            endpoint: config.endpoint || undefined,
            forcePathStyle: !!config.endpoint,
        });
        this.bucket = config.bucket;
        this.localStoragePath = config.localStoragePath;
        this.cdnUrl = config.cdnUrl || "";
    }

    async uploadFile(file: FileDto, fileName: string): Promise<string> {
        const uploadParams = {
            Bucket: this.bucket,
            Key: `${this.localStoragePath}/${fileName}`,
            Body: file.buffer,
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        await this.s3.send(uploadCommand);

        return fileName;
    }

    getFileUrl(file: TWFile): string {
        if (this.cdnUrl) {
            return `${this.cdnUrl}/${
                this.localStoragePath
            }/${encodeURIComponent(file.key)}`;
        }
        return file.key;
    }
}
