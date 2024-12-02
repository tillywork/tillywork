import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/user.entity";
import bcrypt from "bcrypt";
import { CreateUserDto } from "../users/dto/create.user.dto";
import { ProjectsService } from "../projects/projects.service";
import { CreateProjectDto } from "../projects/dto/create.project.dto";
import { Project } from "../projects/project.entity";
import { ProjectUsersService } from "../projects/project-users/project.users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { AccessControl } from "./entities/access.control.entity";
import { Repository } from "typeorm";
import { PermissionLevel } from "@tillywork/shared";
import { Workspace } from "../workspaces/workspace.entity";
import { Space } from "../spaces/space.entity";
import { List } from "../lists/list.entity";
import { Card } from "../cards/card.entity";

export type RegisterResponse =
    | (User & {
          accessToken: string;
      })
    | {
          error: "EMAIL_EXISTS" | "INVALID_INVITE_CODE";
      };

@Injectable()
export class AuthService {
    private readonly logger = new Logger("AuthService");
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private projectsService: ProjectsService,
        private projectUsersService: ProjectUsersService,
        @InjectRepository(AccessControl)
        private accessControlRepository: Repository<AccessControl>
    ) {}

    async login({ user }: { user: User }): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        const payload = {
            ...userWithoutPassword,
            sub: user.id,
        };
        return this.jwtService.sign(payload);
    }

    async validatePassword(
        password: string,
        savedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, savedPassword);
    }

    async validateUser(
        email: string,
        password: string
    ): Promise<{ user: Omit<User, "password">; project: Project } | null> {
        try {
            const user = await this.usersService.findOneByEmailWithPassword(
                email
            );

            if (
                user &&
                (await this.validatePassword(password, user.password))
            ) {
                const project = await this.projectsService.findOneBy({
                    where: {
                        users: {
                            user: {
                                id: user.id,
                            },
                        },
                    },
                });

                return { user, project };
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    async register(createUserDto: CreateUserDto): Promise<RegisterResponse> {
        const emailCheck = await this.usersService.findOneByEmail(
            createUserDto.email
        );

        if (emailCheck) {
            return {
                error: "EMAIL_EXISTS",
            };
        }

        const createdUser = await this.usersService.create(createUserDto);
        const projectDto: CreateProjectDto = {
            name: `${createdUser.firstName}'s Project`,
            ownerId: createdUser.id,
        };
        const project = await this.projectsService.create({
            ...projectDto,
            users: [
                {
                    user: createdUser,
                    role: "owner",
                    project: projectDto as Project,
                },
            ],
        });

        const accessToken = await this.login({
            user: { ...createdUser, project },
        });

        return { ...createdUser, accessToken };
    }

    async registerWithInvite(
        createUserDto: CreateUserDto
    ): Promise<RegisterResponse> {
        const project = await this.projectsService.findOneBy({
            where: { inviteCode: createUserDto.inviteCode },
        });

        if (!project) {
            return {
                error: "INVALID_INVITE_CODE",
            };
        }

        const emailCheck = await this.usersService.findOneByEmail(
            createUserDto.email
        );

        if (emailCheck) {
            return {
                error: "EMAIL_EXISTS",
            };
        }

        const createdUser = await this.usersService.create(createUserDto);
        await this.projectUsersService.create({
            user: createdUser,
            project,
            role: "admin",
        });

        const accessToken = await this.login({
            user: { ...createdUser, project },
        });

        return { ...createdUser, accessToken };
    }

    async joinInvitation({
        inviteCode,
        userId,
    }: {
        inviteCode: string;
        userId: number;
    }): Promise<RegisterResponse> {
        const project = await this.projectsService.findOneBy({
            where: { inviteCode },
        });

        if (!project) {
            return {
                error: "INVALID_INVITE_CODE",
            };
        }

        const user = await this.usersService.findOne(userId);

        await this.projectUsersService.create({
            user,
            project,
            role: "admin",
        });

        const accessToken = await this.login({
            user: { ...user, project },
        });

        return { ...user, accessToken };
    }

    async checkPermission(
        user: User,
        resourceType: "project" | "workspace" | "space" | "list" | "card",
        resourceId: number,
        requiredLevel: PermissionLevel
    ): Promise<boolean> {
        const accessControl = await this.accessControlRepository.findOne({
            where: {
                user: { id: user.id },
                [`${resourceType}`]: { id: resourceId },
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

    // Authorize an action, throwing an exception if not permitted
    async authorize(
        user: User,
        resourceType: "project" | "workspace" | "space" | "list" | "card",
        resourceId: number,
        requiredLevel: PermissionLevel
    ): Promise<void> {
        const hasPermission = await this.checkPermission(
            user,
            resourceType,
            resourceId,
            requiredLevel
        );

        if (!hasPermission) {
            throw new ForbiddenException("Insufficient permissions");
        }
    }

    // Grant permission to a user for a specific resource
    async grantPermission(
        user: User,
        resourceType: "project" | "workspace" | "space" | "list" | "card",
        resource: Project | Workspace | Space | List | Card,
        permissionLevel: PermissionLevel
    ): Promise<AccessControl> {
        const accessControl = this.accessControlRepository.create({
            user,
            permissionLevel,
            [resourceType]: resource,
        });

        return this.accessControlRepository.save(accessControl);
    }

    // Revoke all permissions for a user on a specific resource
    async revokePermissions(
        user: User,
        resourceType: "project" | "workspace" | "space" | "list" | "card",
        resource: Project | Workspace | Space | List | Card
    ): Promise<void> {
        await this.accessControlRepository.delete({
            user: { id: user.id },
            [`${resourceType}`]: { id: resource.id },
        });
    }
}
