import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CardType } from "./card.type.entity";
import { CreateCardTypeDto } from "./dto/create.card.type.dto";
import { UpdateCardTypeDto } from "./dto/update.card.type.dto";
import { ListsService } from "../lists/lists.service";
import { CardsService } from "../cards/cards.service";
import { Workspace } from "../workspaces/workspace.entity";
import { WorkspaceTypes } from "../workspaces/types";
import { PermissionLevel } from "@tillywork/shared";
import { ClsService } from "nestjs-cls";
import { AccessControlService } from "../auth/services/access.control.service";
import { IsNotEmpty } from "class-validator";

export class FindAllParams {
    @IsNotEmpty()
    workspaceId: number;
}

@Injectable()
export class CardTypesService {
    constructor(
        @InjectRepository(CardType)
        private cardTypesRepository: Repository<CardType>,
        private listsService: ListsService,
        private cardsService: CardsService,
        private accessControlService: AccessControlService,
        private clsService: ClsService
    ) {}

    async findAll({ workspaceId }: FindAllParams): Promise<CardType[]> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "workspace",
            workspaceId,
            PermissionLevel.VIEWER
        );

        return this.cardTypesRepository.find({
            where: {
                workspace: {
                    id: workspaceId,
                },
            },
        });
    }

    async findOne(id: number): Promise<CardType> {
        const user = this.clsService.get("user");
        const cardType = await this.cardTypesRepository.findOne({
            where: { id },
            loadRelationIds: {
                relations: ["workspace"],
            },
        });

        if (!cardType) {
            throw new NotFoundException(`CardType with ID ${id} not found`);
        }

        await this.accessControlService.authorize(
            user,
            "workspace",
            cardType.workspace as unknown as number,
            PermissionLevel.VIEWER
        );

        return cardType;
    }

    async create(createCardTypeDto: CreateCardTypeDto): Promise<CardType> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "workspace",
            createCardTypeDto.workspaceId,
            PermissionLevel.EDITOR
        );

        const cardType = this.cardTypesRepository.create({
            ...createCardTypeDto,
            workspace: {
                id: createCardTypeDto.workspaceId,
            },
        });
        return this.cardTypesRepository.save(cardType);
    }

    async update(
        id: number,
        updateCardTypeDto: UpdateCardTypeDto
    ): Promise<CardType> {
        const user = this.clsService.get("user");
        const cardType = await this.findOne(id);

        await this.accessControlService.authorize(
            user,
            "workspace",
            cardType.workspace as unknown as number,
            PermissionLevel.EDITOR
        );

        this.cardTypesRepository.merge(cardType, updateCardTypeDto);
        return this.cardTypesRepository.save(cardType);
    }

    async remove({
        id,
        replacementCardType,
    }: {
        id: number;
        replacementCardType: CardType;
    }): Promise<void> {
        const user = this.clsService.get("user");
        const cardType = await this.findOne(id);

        await this.accessControlService.authorize(
            user,
            "workspace",
            cardType.workspace as unknown as number,
            PermissionLevel.EDITOR
        );

        // Update lists that use this as a default type
        await this.listsService.batchUpdate(
            {
                defaultCardType: cardType,
            },
            {
                defaultCardType: replacementCardType,
            }
        );

        // Update cards that have this type
        await this.cardsService.batchUpdate(
            {
                type: cardType,
            },
            {
                type: replacementCardType,
            }
        );

        await this.cardTypesRepository.softRemove(cardType);
    }

    async createDefaultWorkspaceTypes(workspace: Workspace) {
        const defaultTypes: string[] = [];
        switch (workspace.type) {
            case WorkspaceTypes.PROJECT_MANAGEMENT:
                defaultTypes.push("Task");
                break;
            case WorkspaceTypes.CRM:
                defaultTypes.push("Contact");
                defaultTypes.push("Organization");
                defaultTypes.push("Deal");
                break;
            case WorkspaceTypes.AGILE_PROJECTS:
                defaultTypes.push("Issue");
        }

        const cardTypes = defaultTypes.map((type) => {
            return new Promise((resolve) => {
                const cardType = this.cardTypesRepository.create({
                    name: type,
                    createdByType: "system",
                    workspace,
                });

                this.cardTypesRepository.save(cardType).then((cardType) => {
                    resolve(cardType);
                });
            });
        });

        const promiseResults = await Promise.allSettled(cardTypes);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promiseResults.map((pr) => (pr as any).value);
    }
}
