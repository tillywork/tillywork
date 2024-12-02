import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, IsNull, Not, Repository } from "typeorm";
import { Space } from "./space.entity";
import { CreateSpaceDto } from "./dto/create.space.dto";
import { UpdateSpaceDto } from "./dto/update.space.dto";
import { SpaceSideEffectsService } from "./space.side.effects.service";
import { CardType } from "../card-types/card.type.entity";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { AuthService } from "../auth/auth.service";
import { ClsService } from "nestjs-cls";
import { AccessControl } from "../auth/entities/access.control.entity";
import { PermissionLevel } from "@tillywork/shared";

export type SpaceFindAllResult = {
    total: number;
    spaces: Space[];
};

export class FindAllParams {
    @IsNotEmpty()
    @IsNumberString()
    workspaceId: number;
}

@Injectable()
export class SpacesService {
    constructor(
        @InjectRepository(Space)
        private spacesRepository: Repository<Space>,
        private spaceSideEffectsService: SpaceSideEffectsService,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private clsService: ClsService
    ) {}

    async findAll({ workspaceId }: FindAllParams): Promise<Space[]> {
        const user = this.clsService.get("user");

        const accessControlEntries = await this.spacesRepository.manager
            .getRepository(AccessControl)
            .find({
                where: {
                    user: {
                        id: user.id,
                    },
                    space: {
                        id: Not(IsNull()),
                    },
                    permissionLevel: Not(PermissionLevel.NONE),
                },
                loadRelationIds: {
                    relations: ["space"],
                },
            });

        const spaceIds = accessControlEntries.map((entry) => entry.space);
        const where: FindOptionsWhere<Space> = {
            id: In(spaceIds),
            workspace: {
                id: workspaceId,
            },
        };

        return this.spacesRepository.find({
            where,
            order: {
                createdAt: "ASC",
                lists: {
                    createdAt: "ASC",
                },
            },
        });
    }

    async findOne(id: number): Promise<Space> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "space",
            id,
            PermissionLevel.VIEWER
        );

        const space = await this.spacesRepository.findOne({ where: { id } });
        if (!space) {
            throw new NotFoundException(`Space with ID ${id} not found`);
        }

        return space;
    }

    async create(createSpaceDto: CreateSpaceDto): Promise<Space> {
        const space = this.spacesRepository.create(createSpaceDto);
        await this.spacesRepository.save(space);

        if (createSpaceDto.createOnboardingData) {
            const cardType = await this.spacesRepository.manager
                .getRepository(CardType)
                .findOne({
                    where: {
                        workspace: {
                            id: space.workspaceId,
                        },
                    },
                });
            const list = await this.spaceSideEffectsService.postCreate({
                space,
                defaultCardType: cardType,
            });
            space.lists = [list];
        }

        return space;
    }

    async update(id: number, updateSpaceDto: UpdateSpaceDto): Promise<Space> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "space",
            id,
            PermissionLevel.EDITOR
        );

        const space = await this.findOne(id);

        this.spacesRepository.merge(space, updateSpaceDto);
        return this.spacesRepository.save(space);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "space",
            id,
            PermissionLevel.EDITOR
        );

        const space = await this.findOne(id);

        await this.spacesRepository.softRemove(space);
    }
}
