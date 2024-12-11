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
                `Insufficient permissions: ${resourceType} - ${resourceId} - ${requiredLevel}`
            );
        }
    }

    /**
     * Grants a user access to a resource, and it's public children.
     * @param user
     * @param resourceType
     * @param resourceId
     * @param permissionLevel
     * @returns The AccessControl entity.
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
        const childResourceMaps = {
            project: ["workspace"],
            workspace: ["space", "list"],
            space: ["list"],
        };
        const childResourceTypes = childResourceMaps[resourceType] || [];

        await Promise.all(
            childResourceTypes.map(async (childResourceType) => {
                let childResources;

                switch (resourceType) {
                    case "project":
                        childResources =
                            await this.accessControlRepository.manager
                                .getRepository(Workspace)
                                .find({
                                    where: {
                                        projectId: resourceId,
                                        accessType: AccessType.PUBLIC,
                                    },
                                });
                        break;
                    case "workspace":
                        childResources =
                            await this.accessControlRepository.manager
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
                        childResources =
                            await this.accessControlRepository.manager
                                .getRepository(List)
                                .find({
                                    where: {
                                        spaceId: resourceId,
                                        accessType: AccessType.PUBLIC,
                                    },
                                });
                        break;
                    default:
                        childResources = [];
                }

                await Promise.all(
                    childResources.map(async (childResource) => {
                        await this.grantPermission(
                            user,
                            childResourceType,
                            childResource.id,
                            permissionLevel
                        );
                    })
                );
            })
        );

        return accessControl;
    }

    /**
     * Revokes a user's access to a certain resource.
     * @param user
     * @param resourceType
     * @param resourceId
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
}
