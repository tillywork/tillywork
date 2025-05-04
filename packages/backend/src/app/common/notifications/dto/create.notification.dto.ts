import { NotificationType } from "@tillywork/shared";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateNotificationDto {
    @IsNotEmpty()
    type: NotificationType;

    @IsNotEmpty()
    recipientId: number;

    @IsNotEmpty()
    workspaceId: number;

    @IsOptional()
    relatedResourceId?: string;

    @IsOptional()
    relatedResourceType?: string;

    @IsOptional()
    color?: string;

    @IsNotEmpty()
    message: string;

    @IsOptional()
    isRead?: boolean;
}
