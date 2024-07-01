import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { CardType } from "./card.type.entity";
import { CreateCardTypeDto } from "./dto/create.card.type.dto";
import { UpdateCardTypeDto } from "./dto/update.card.type.dto";
import { ListsService } from "../lists/lists.service";
import { CardsService } from "../cards/cards.service";
import { Workspace } from "../workspaces/workspace.entity";
import { WorkspaceTypes } from "../workspaces/types";

@Injectable()
export class CardTypesService {
    constructor(
        @InjectRepository(CardType)
        private cardTypesRepository: Repository<CardType>,
        private listsService: ListsService,
        private cardsService: CardsService
    ) {}

    async findAll(options?: FindManyOptions<CardType>): Promise<CardType[]> {
        return this.cardTypesRepository.find(options);
    }

    async findOne(id: number): Promise<CardType> {
        const cardType = await this.cardTypesRepository.findOne({
            where: { id },
        });
        if (!cardType) {
            throw new NotFoundException(`CardType with ID ${id} not found`);
        }
        return cardType;
    }

    async findOneBy({
        where,
    }: {
        where: FindOptionsWhere<CardType>;
    }): Promise<CardType> {
        return this.cardTypesRepository.findOne({ where });
    }

    async create(createCardTypeDto: CreateCardTypeDto): Promise<CardType> {
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
        const cardType = await this.findOne(id);
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
        const cardType = await this.findOne(id);

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
