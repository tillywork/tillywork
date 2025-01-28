import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { StorageAdapter } from "./storage.adapter";
import { FileDto } from "../types";
import { TWFile } from "../file.entity";

export class AzureStorageAdapter implements StorageAdapter {
    private readonly blobServiceClient: BlobServiceClient;
    private readonly containerName: string;
    private readonly localStoragePath: string;
    private readonly cdnUrl: string;

    constructor(config: {
        connectionString: string;
        containerName: string;
        localStoragePath: string;
        cdnUrl?: string;
    }) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(
            config.connectionString
        );
        this.containerName = config.containerName;
        this.localStoragePath = config.localStoragePath;
        this.cdnUrl = config.cdnUrl || "";
    }

    private getBlobClient(fileName: string): BlockBlobClient {
        const containerClient = this.blobServiceClient.getContainerClient(
            this.containerName
        );
        const blobPath = `${this.localStoragePath}/${fileName}`;
        return containerClient.getBlockBlobClient(blobPath);
    }

    async uploadFile(file: FileDto, fileName: string): Promise<string> {
        const blobClient = this.getBlobClient(fileName);

        await blobClient.upload(file.buffer, file.buffer.length, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype,
            },
        });

        return fileName;
    }

    getFileUrl(file: TWFile): string {
        if (this.cdnUrl) {
            return `${this.cdnUrl}/${
                this.localStoragePath
            }/${encodeURIComponent(file.key)}`;
        }

        const blobClient = this.getBlobClient(file.key);
        return blobClient.url;
    }
}
