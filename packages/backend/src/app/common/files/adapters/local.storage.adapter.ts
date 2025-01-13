import { promises as fs } from "fs";
import path from "path";
import { StorageAdapter } from "./storage.adapter";
import { FileDto } from "../types";
import { TWFile } from "../file.entity";

export class LocalStorageAdapter implements StorageAdapter {
    private readonly storagePath: string;
    private readonly apiUrl: string;

    constructor(config: { storagePath: string; apiUrl: string }) {
        this.storagePath = config.storagePath;
        this.apiUrl = config.apiUrl;
    }

    async uploadFile(file: FileDto, fileName: string): Promise<string> {
        const filePath = path.join(this.storagePath, fileName);

        // Ensure the directory exists
        await fs.mkdir(this.storagePath, { recursive: true });

        // Save the file locally
        await fs.writeFile(filePath, file.buffer);

        return fileName;
    }

    getFileUrl(file: TWFile): string {
        return `${this.apiUrl}/files/${file.id}`;
    }
}
