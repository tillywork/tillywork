import { Injectable, Logger } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/user.entity";
import bcrypt from "bcrypt";
import { CreateUserDto } from "../../users/dto/create.user.dto";
import { ProjectsService } from "../../projects/projects.service";
import { CreateProjectDto } from "../../projects/dto/create.project.dto";
import { Project } from "../../projects/project.entity";
import { ProjectUsersService } from "../../projects/project-users/project.users.service";
import { ClsService } from "nestjs-cls";
import { NotificationPreferenceService } from "../../notifications/notification-preference/notification.preference.service";
import { NotificationChannel } from "@tillywork/shared";

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
        private clsService: ClsService,
        private notificationPreferenceService: NotificationPreferenceService
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

            if (!user) {
                return null;
            }

            const isPasswordValid = await this.validatePassword(
                password,
                user.password
            );

            if (!isPasswordValid) {
                return null;
            }

            this.clsService.setIfUndefined("user", user);
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
        } catch (error) {
            this.logger.error(error);
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
        await this.notificationPreferenceService.upsert(createdUser.id, {
            channel: NotificationChannel.IN_APP,
            enabled: true,
            config: {},
        });
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
        const project = await this.projectsService.findOneByInviteCode(
            createUserDto.inviteCode
        );

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
        await this.notificationPreferenceService.upsert(createdUser.id, {
            channel: NotificationChannel.IN_APP,
            enabled: true,
            config: {},
        });
        await this.projectUsersService.create({
            user: createdUser,
            project,
            role: "editor",
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
            role: "editor",
        });

        const accessToken = await this.login({
            user: { ...user, project },
        });

        return { ...user, accessToken };
    }
}
