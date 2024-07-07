import { User } from "../../users/user.entity";
import { TWFileType } from "../types";

export class CreateFileDto {
    name: string;
    key: string;
    url?: string;
    type: TWFileType;
    size: number;
    createdBy: User;
    projectId: number;
}
