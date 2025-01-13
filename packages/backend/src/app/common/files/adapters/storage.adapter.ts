import { TWFile } from "../file.entity";
import { FileDto } from "../types";

export interface StorageAdapter {
    uploadFile(file: FileDto, fileName: string): Promise<string>;
    getFileUrl(file: TWFile): string;
}
