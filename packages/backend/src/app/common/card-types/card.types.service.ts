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
import { CardTypesSideEffectsService } from "./card.types.side.effects.service";
import { CardTypeLayout } from "@tillywork/shared";

export class FindAllParams {
    @IsNotEmpty()
    workspaceId: number;
}

type DefaultWorkspaceCardType = {
    name: string;
    layout?: CardTypeLayout;
    dependsOn?: string[];
    hasChildren?: boolean;
    titleTemplate?: string;
};

@Injectable()
export class CardTypesService {
    constructor(
        @InjectRepository(CardType)
        private cardTypesRepository: Repository<CardType>,
        private listsService: ListsService,
        private cardsService: CardsService,
        private accessControlService: AccessControlService,
        private clsService: ClsService,
        private cardTypesSideEffectsService: CardTypesSideEffectsService
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

        let cardType = this.cardTypesRepository.create({
            ...createCardTypeDto,
            workspace: createCardTypeDto.workspace ?? {
                id: createCardTypeDto.workspaceId,
            },
        });

        cardType = await this.cardTypesRepository.save(cardType);
        cardType = await this.cardTypesSideEffectsService.postCreate({
            cardType,
        });

        return cardType;
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

    async createDefaultWorkspaceTypes(
        workspace: Workspace
    ): Promise<CardType[]> {
        const defaultTypes: DefaultWorkspaceCardType[] = [];

        switch (workspace.type) {
            case WorkspaceTypes.PROJECT_MANAGEMENT:
                defaultTypes.push({ name: "Task" });
                break;
            case WorkspaceTypes.CRM:
                defaultTypes.push({
                    name: "Contact",
                    layout: CardTypeLayout.PERSON,
                    dependsOn: ["Organization"],
                    hasChildren: false,
                    titleTemplate: "{{first_name}} {{last_name}}",
                });
                defaultTypes.push({
                    name: "Organization",
                    layout: CardTypeLayout.ORGANIZATION,
                    hasChildren: false,
                });
                defaultTypes.push({
                    name: "Deal",
                    layout: CardTypeLayout.DEAL,
                    dependsOn: ["Organization"],
                    hasChildren: false,
                });
                break;
            case WorkspaceTypes.AGILE_PROJECTS:
                defaultTypes.push({ name: "Issue" });
                break;
        }

        const createdCardTypes: Record<string, CardType> = {};

        const createCardType = async (
            type: DefaultWorkspaceCardType
        ): Promise<CardType> => {
            if (createdCardTypes[type.name]) {
                return createdCardTypes[type.name];
            }

            if (type.dependsOn && type.dependsOn.length > 0) {
                for (const dependencyName of type.dependsOn) {
                    const dependency = defaultTypes.find(
                        (t) => t.name === dependencyName
                    );
                    if (dependency) {
                        await createCardType(dependency);
                    } else {
                        throw new Error(
                            `Dependency "${dependencyName}" for card type "${type.name}" not found.`
                        );
                    }
                }
            }

            const cardType = await this.create({
                name: type.name,
                layout: type.layout,
                hasChildren: type.hasChildren,
                titleTemplate: type.titleTemplate,
                createdByType: "system",
                workspaceId: workspace.id,
                workspace,
            });

            createdCardTypes[type.name] = cardType;
            return cardType;
        };

        for (const type of defaultTypes) {
            await createCardType(type);
        }

        return Object.values(createdCardTypes);
    }
}
