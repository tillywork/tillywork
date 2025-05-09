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
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ClsService } from "nestjs-cls";
import { AccessControl } from "../auth/entities/access.control.entity";
import { PermissionLevel } from "@tillywork/shared";
import { AccessControlService } from "../auth/services/access.control.service";

export type SpaceFindAllResult = {
    total: number;
    spaces: Space[];
};

export class FindAllParams {
    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;

    @IsOptional()
    @IsBoolean()
    lists?: boolean;
}

@Injectable()
export class SpacesService {
    constructor(
        @InjectRepository(Space)
        private spacesRepository: Repository<Space>,
        private spaceSideEffectsService: SpaceSideEffectsService,
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService,
        private clsService: ClsService
    ) {}

    async findAll({ workspaceId, lists }: FindAllParams): Promise<Space[]> {
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

        const relations = [];

        if (lists) relations.push("lists");

        return this.spacesRepository.find({
            where,
            order: {
                createdAt: "ASC",
                lists: {
                    createdAt: "ASC",
                },
            },
            relations,
        });
    }

    async findOne(id: number): Promise<Space> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
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

        await this.accessControlService.applyResourceAccess(space, "space");

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

        await this.accessControlService.authorize(
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

        await this.accessControlService.authorize(
            user,
            "space",
            id,
            PermissionLevel.EDITOR
        );

        const space = await this.findOne(id);

        await this.spacesRepository.softRemove(space);
    }
}
