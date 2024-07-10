/* eslint-disable @typescript-eslint/no-explicit-any */

export type FileDto = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
};

export enum TWFileType {
    FILE = "file",
    IMAGE = "image",
}
