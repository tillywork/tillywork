import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsInt, IsEnum } from "class-validator";
import {
    ProjectUserActivityEntityTypes,
    ProjectUserActivityTypes,
} from "../../types";

export class CreateProjectUserActivityDto {
    @IsNotEmpty()
    @IsInt()
    userId: number;

    @IsNotEmpty()
    @IsInt()
    projectId: number;

    @IsNotEmpty()
    @IsInt()
    workspaceId: number;

    @IsNotEmpty()
    @IsEnum(ProjectUserActivityTypes)
    type: ProjectUserActivityTypes;

    @Optional()
    @IsInt()
    entityId?: number;

    @Optional()
    @IsEnum(ProjectUserActivityEntityTypes)
    entityType?: ProjectUserActivityEntityTypes;
}
