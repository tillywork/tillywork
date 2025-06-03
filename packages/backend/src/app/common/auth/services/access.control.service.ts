import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import {
    AccessControlResourceType,
    AccessType,
    PermissionLevel,
} from "@tillywork/shared";
import { AccessControl } from "../entities/access.control.entity";
import { User } from "../../users/user.entity";
import { AccessStrategyFactory } from "../factories/access.strategy.factory";
import { Project } from "../../projects/project.entity";
import { Workspace } from "../../workspaces/workspace.entity";
import { Space } from "../../spaces/space.entity";
import { List } from "../../lists/list.entity";

export type AccessControlResource = Project | Workspace | Space | List;

@Injectable()
export class AccessControlService {
    private readonly logger = new Logger("AccessControlService");

    constructor(
        @InjectRepository(AccessControl)
        public accessControlRepository: Repository<AccessControl>,
        private readonly accessStrategyFactory: AccessStrategyFactory
    ) {}

    /**
     * Checks the users permission based on the accessed resource.
     * @param user The user from the JWT token
     * @param resourceType The type of the resource
     * @param resourceId The accessed resource ID
     * @param requiredLevel The minimum permission level required to access the resource
     * @returns boolean
     */
    async checkPermission(
        user: User,
        resourceType: AccessControlResourceType,
        resourceId: number | number[],
        requiredLevel: PermissionLevel
    ): Promise<boolean> {
        const accessControl = await this.accessControlRepository.findOne({
            where: {
                user: { id: user.id },
                [resourceType]: {
                    id: Array.isArray(resourceId) ? In(resourceId) : resourceId,
                },
            },
        });

        if (!accessControl) {
            return false;
        }

        const permissionOrder = [
            PermissionLevel.NONE,
            PermissionLevel.VIEWER,
            PermissionLevel.EDITOR,
            PermissionLevel.OWNER,
        ];

        return (
            permissionOrder.indexOf(accessControl.permissionLevel) >=
            permissionOrder.indexOf(requiredLevel)
        );
    }

    /**
     * Authorizes the user request to access the resource if he has access, or throw an error if user doesn't have access.
     * @param user The user from the JWT token
     * @param resourceType The type of the resource
     * @param resourceId The accessed resource ID
     * @param requiredLevel The minimum permission level required to access the resource
     */
    async authorize(
        user: User,
        resourceType: AccessControlResourceType,
        resourceId: number | number[],
        requiredLevel: PermissionLevel
    ): Promise<void> {
        const hasPermission = await this.checkPermission(
            user,
            resourceType,
            resourceId,
            requiredLevel
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                `Insufficient permissions: ${resourceType} ${resourceId}`
            );
        }
    }

    private async _getChildResources(
        resourceType: AccessControlResourceType,
        resourceId: number
    ) {
        const childResourceMaps = {
            project: ["workspace"],
            workspace: ["space", "list"],
            space: ["list"],
        };
        const childResourceTypes = childResourceMaps[resourceType] || [];
        const children: { type: AccessControlResourceType; items: any[] }[] =
            [];
        for (const childResourceType of childResourceTypes) {
            let childItems = [];
            switch (resourceType) {
                case "project":
                    childItems = await this.accessControlRepository.manager
                        .getRepository(Workspace)
                        .find({
                            where: {
                                projectId: resourceId,
                                accessType: AccessType.PUBLIC,
                            },
                        });
                    break;
                case "workspace":
                    childItems = await this.accessControlRepository.manager
                        .getRepository(
                            childResourceType === "space" ? Space : List
                        )
                        .find({
                            where: {
                                workspaceId: resourceId,
                                accessType: AccessType.PUBLIC,
                            },
                        });
                    break;
                case "space":
                    childItems = await this.accessControlRepository.manager
                        .getRepository(List)
                        .find({
                            where: {
                                spaceId: resourceId,
                                accessType: AccessType.PUBLIC,
                            },
                        });
                    break;
                default:
                    childItems = [];
            }
            children.push({ type: childResourceType, items: childItems });
        }
        return children;
    }

    /**
     * Grants a user access to a resource, and it's public children.
     */
    async grantPermission(
        user: User,
        resourceType: AccessControlResourceType,
        resourceId: number,
        permissionLevel: PermissionLevel
    ): Promise<AccessControl> {
        const permissionExists = await this.accessControlRepository.findOneBy({
            user: {
                id: user.id,
            },
            [resourceType]: {
                id: resourceId,
            },
        });

        if (permissionExists) {
            return;
        }

        const accessControl = this.accessControlRepository.create({
            user: {
                id: user.id,
            },
            permissionLevel,
            [resourceType]: {
                id: resourceId,
            },
        });

        await this.accessControlRepository.save(accessControl);

        // Give access to all public children of this resource
        const children = await this._getChildResources(
            resourceType,
            resourceId
        );
        for (const child of children) {
            for (const item of child.items) {
                await this.grantPermission(
                    user,
                    child.type,
                    item.id,
                    permissionLevel
                );
            }
        }

        return accessControl;
    }

    /**
     * Revokes a user's access to a certain resource and its public children.
     */
    async revokePermissions(
        user: User,
        resourceType: AccessControlResourceType,
        resourceId: number
    ): Promise<void> {
        await this.accessControlRepository.delete({
            user: { id: user.id },
            [resourceType]: { id: resourceId },
        });

        // Revoke access to all public children of this resource
        const children = await this._getChildResources(
            resourceType,
            resourceId
        );
        for (const child of children) {
            for (const item of child.items) {
                await this.revokePermissions(user, child.type, item.id);
            }
        }
    }

    /**
     * Applies the correct access control on a resource, when it is created or updated, depending on the resource's access type.
     * @param resource The updated or created resource.
     * @param resourceType The resource's type. (Workspace, space, etc..)
     */
    async applyResourceAccess(
        resource: AccessControlResource,
        resourceType: AccessControlResourceType
    ): Promise<void> {
        const strategy = this.accessStrategyFactory.getStrategy(resourceType);
        await strategy.applyAccess(resource, resourceType);
    }

    async findAll({
        userId,
        resourceType,
        resourceId,
    }: {
        userId?: number;
        resourceType: AccessControlResourceType;
        resourceId: number | number[];
    }): Promise<AccessControl[]> {
        const accessControl = await this.accessControlRepository.find({
            where: {
                user: { id: userId },
                [resourceType]: {
                    id: Array.isArray(resourceId) ? In(resourceId) : resourceId,
                },
            },
            relations: ["user"],
        });

        return accessControl;
    }

    async findAllForUser(userId: number) {
        return this.accessControlRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: ["project", "workspace", "space", "list"],
        });
    }
}
