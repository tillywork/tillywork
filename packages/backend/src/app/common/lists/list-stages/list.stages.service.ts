import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { ListStage } from "./list.stage.entity";
import { CreateListStageDto } from "./dto/create.list.stage.dto";
import { UpdateListStageDto } from "./dto/update.list.stage.dto";
import { CardListsService } from "../../cards/card-lists/card.lists.service";
import { ClsService } from "nestjs-cls";
import { AccessControlService } from "../../auth/services/access.control.service";
import { PermissionLevel } from "@tillywork/shared";
import { AclContext } from "../../auth/context/acl.context";

export type ListStageFindAllResult = {
    total: number;
    lists: ListStage[];
};

export type FindAllParams = {
    listId: number;
    hideCompleted?: boolean;
};

@Injectable()
export class ListStagesService {
    constructor(
        @InjectRepository(ListStage)
        private listStagesRepository: Repository<ListStage>,
        private cardListsService: CardListsService,
        private clsService: ClsService,
        private accessControlService: AccessControlService,
        private aclContext: AclContext
    ) {}

    async findAll({
        listId,
        hideCompleted,
    }: FindAllParams): Promise<ListStage[]> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            listId,
            PermissionLevel.VIEWER
        );

        const where: FindOptionsWhere<ListStage> = {
            listId,
        };

        if (hideCompleted) {
            where.isCompleted = false;
        }

        return this.listStagesRepository.find({
            where,
            order: {
                order: "ASC",
            },
        });
    }

    async findOne(id: number): Promise<ListStage> {
        const user = this.clsService.get("user");
        const listStage = await this.listStagesRepository.findOne({
            where: {
                id,
            },
        });

        if (!listStage) {
            throw new NotFoundException(`ListStage with ID ${id} not found`);
        }

        if (!this.aclContext.shouldSkipAcl()) {
            await this.accessControlService.authorize(
                user,
                "list",
                listStage.listId,
                PermissionLevel.VIEWER
            );
        }

        return listStage;
    }

    async findBy({
        where,
    }: {
        where: FindOptionsWhere<ListStage>;
    }): Promise<ListStage[]> {
        return this.listStagesRepository.find({ where });
    }

    async create(createListStageDto: CreateListStageDto): Promise<ListStage> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            createListStageDto.listId,
            PermissionLevel.EDITOR
        );

        const listStage = this.listStagesRepository.create(createListStageDto);
        await this.listStagesRepository.save(listStage);

        return listStage;
    }

    async update(
        id: number,
        updateListStageDto: UpdateListStageDto
    ): Promise<ListStage> {
        const listStage = await this.findOne(id);
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            listStage.listId,
            PermissionLevel.EDITOR
        );

        this.listStagesRepository.merge(listStage, updateListStageDto);
        return this.listStagesRepository.save(listStage);
    }

    async reorder(
        listStages: Pick<ListStage, "id" | "order" | "listId">[]
    ): Promise<ListStage[]> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            listStages[0].listId,
            PermissionLevel.EDITOR
        );

        const listStagesToUpdated = await Promise.all(
            listStages.map(async ({ id, order }) => {
                const listStage = await this.findOne(id);
                this.listStagesRepository.merge(listStage, { order });
                return listStage;
            })
        );
        return this.listStagesRepository.save(listStagesToUpdated);
    }

    async remove(id: number, replacementListStage: ListStage): Promise<void> {
        const listStage = await this.findOne(id);
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            listStage.listId,
            PermissionLevel.EDITOR
        );

        // Update cards that have this list stage
        await this.cardListsService.batchUpdate(
            {
                listStage,
            },
            {
                listStage: replacementListStage,
            }
        );

        await this.listStagesRepository.remove(listStage);
    }
}
