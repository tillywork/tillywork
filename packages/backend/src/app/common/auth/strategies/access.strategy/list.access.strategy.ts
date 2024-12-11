import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { AccessStrategy } from "./access.strategy";
import { AccessType, PermissionLevel } from "@tillywork/shared";
import { AccessControlService } from "../../services/access.control.service";
import { ClsService } from "nestjs-cls";
import { Not } from "typeorm";
import { Workspace } from "src/app/common/workspaces/workspace.entity";
import { List } from "src/app/common/lists/list.entity";
import { Space } from "src/app/common/spaces/space.entity";

@Injectable()
export class ListAccessStrategy implements AccessStrategy {
    private readonly logger = new Logger("ListAccessStrategy");

    constructor(
        private clsService: ClsService,
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService
    ) {}

    async applyAccess(resource: List): Promise<void> {
        const user = this.clsService.get("user");

        await this.accessControlService.grantPermission(
            user,
            "list",
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

    async handlePublicAccess(resource: List): Promise<void> {
        this.inheritParentAccess(resource);
    }

    async handlePrivateAccess(resource: List): Promise<void> {
        const parentType = resource.spaceId ? "space" : "workspace";
        const parent =
            await this.accessControlService.accessControlRepository.manager.findOne(
                parentType === "space" ? Space : Workspace,
                {
                    where: {
                        id: resource[`${parentType}Id`],
                    },
                }
            );

        if (parent.accessType === AccessType.PRIVATE) {
            this.inheritParentAccess(resource);
        }
    }

    async inheritParentAccess(resource: List): Promise<void> {
        const user = this.clsService.get("user");
        const parentType = resource.spaceId ? "space" : "workspace";
        const parent =
            await this.accessControlService.accessControlRepository.manager.findOne(
                parentType === "space" ? Space : Workspace,
                {
                    where: {
                        id: resource[`${parentType}Id`],
                    },
                }
            );

        const parentAccessControl =
            await this.accessControlService.accessControlRepository.find({
                where: {
                    [parentType]: {
                        id: parent.id,
                    },
                    user: {
                        id: Not(user.id),
                    },
                },
                relations: ["user"],
            });

        await Promise.all(
            parentAccessControl.map((accessControl) =>
                this.accessControlService.grantPermission(
                    accessControl.user,
                    "list",
                    resource.id,
                    accessControl.permissionLevel
                )
            )
        );
    }
}
