import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { AccessStrategy } from "./access.strategy";
import { AccessType, PermissionLevel } from "@tillywork/shared";
import { AccessControlService } from "../../services/access.control.service";
import { Space } from "src/app/common/spaces/space.entity";
import { ClsService } from "nestjs-cls";
import { Not } from "typeorm";
import { Workspace } from "src/app/common/workspaces/workspace.entity";

@Injectable()
export class SpaceAccessStrategy implements AccessStrategy {
    private readonly logger = new Logger("SpaceAccessStrategy");

    constructor(
        private clsService: ClsService,
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService
    ) {}

    async applyAccess(resource: Space): Promise<void> {
        const user = this.clsService.get("user");

        await this.accessControlService.grantPermission(
            user,
            "space",
            resource.id,
            PermissionLevel.OWNER
        );

        switch (resource.accessType) {
            case AccessType.PUBLIC:
                return this.handlePublicAccess(resource);

            case AccessType.PRIVATE:
                return this.handlePrivateAccess(resource);
        }
    }

    async handlePublicAccess(resource: Space): Promise<void> {
        this.inheritParentAccess(resource);
    }

    async handlePrivateAccess(resource: Space): Promise<void> {
        const workspace =
            await this.accessControlService.accessControlRepository.manager.findOne(
                Workspace,
                {
                    where: {
                        id: resource.workspaceId,
                    },
                }
            );

        if (workspace.accessType === AccessType.PRIVATE) {
            this.inheritParentAccess(resource);
        }
    }

    async inheritParentAccess(resource: Space): Promise<void> {
        const user = this.clsService.get("user");
        const workspace =
            await this.accessControlService.accessControlRepository.manager.findOne(
                Workspace,
                {
                    where: {
                        id: resource.workspaceId,
                    },
                }
            );

        const workspaceAccessControl =
            await this.accessControlService.accessControlRepository.find({
                where: {
                    workspace: {
                        id: workspace.id,
                    },
                    user: {
                        id: Not(user.id),
                    },
                },
                relations: ["user"],
            });

        await Promise.all(
            workspaceAccessControl.map((accessControl) =>
                this.accessControlService.grantPermission(
                    accessControl.user,
                    "space",
                    resource.id,
                    accessControl.permissionLevel
                )
            )
        );
    }
}
