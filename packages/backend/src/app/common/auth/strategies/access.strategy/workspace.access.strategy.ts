/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AccessStrategy } from "./access.strategy";
import { AccessType, PermissionLevel } from "@tillywork/shared";
import { AccessControlService } from "../../services/access.control.service";
import { Workspace } from "src/app/common/workspaces/workspace.entity";
import { Not } from "typeorm";
import { User } from "src/app/common/users/user.entity";

@Injectable()
export class WorkspaceAccessStrategy implements AccessStrategy {
    constructor(
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService
    ) {}

    async applyAccess(resource: Workspace): Promise<void> {
        if (resource.ownerId) {
            const owner = { id: resource.ownerId } as User;

            if (owner) {
                await this.accessControlService.grantPermission(
                    owner,
                    "workspace",
                    resource.id,
                    PermissionLevel.OWNER
                );
            }
        }

        switch (resource.accessType) {
            case AccessType.PUBLIC:
                return this.handlePublicAccess(resource);

            default:
                break;
        }
    }

    async handlePublicAccess(resource: Workspace): Promise<void> {
        const projectAccessControl =
            await this.accessControlService.accessControlRepository.find({
                where: {
                    project: {
                        id: resource.projectId,
                    },
                    user: {
                        id: Not(resource.ownerId),
                    },
                },
                relations: ["user"],
            });

        await Promise.all(
            projectAccessControl.map((accessControl) =>
                this.accessControlService.grantPermission(
                    accessControl.user,
                    "workspace",
                    resource.id,
                    accessControl.permissionLevel
                )
            )
        );
    }
}
