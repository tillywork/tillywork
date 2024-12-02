import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    FindOptionsWhere,
    In,
    IsNull,
    Not,
    Repository,
    UpdateResult,
} from "typeorm";
import { List } from "./list.entity";
import { CreateListDto } from "./dto/create.list.dto";
import { UpdateListDto } from "./dto/update.list.dto";
import { ListSideEffectsService } from "./list.side.effects.service";
import { AuthService } from "../auth/auth.service";
import { ClsService } from "nestjs-cls";
import { AccessControl } from "../auth/entities/access.control.entity";
import { PermissionLevel } from "@tillywork/shared";

export type ListFindAllResult = {
    total: number;
    lists: List[];
};

export type FindAllParams = {
    spaceId?: number;
    workspaceId?: number;
    throughSpace?: boolean;
};

@Injectable()
export class ListsService {
    constructor(
        @InjectRepository(List)
        private listsRepository: Repository<List>,
        private listSideEffectsService: ListSideEffectsService,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private clsService: ClsService
    ) {}

    async findAll({
        spaceId,
        workspaceId,
        throughSpace,
    }: FindAllParams): Promise<List[]> {
        const user = this.clsService.get("user");

        const accessControlEntries = await this.listsRepository.manager
            .getRepository(AccessControl)
            .find({
                where: {
                    user: {
                        id: user.id,
                    },
                    list: {
                        id: Not(IsNull()),
                    },
                    permissionLevel: Not(PermissionLevel.NONE),
                },
                loadRelationIds: {
                    relations: ["list"],
                },
            });

        const listIds = accessControlEntries.map((entry) => entry.list);
        const where: FindOptionsWhere<List> = {
            id: In(listIds),
        };

        if (spaceId) {
            where.spaceId = spaceId;
        }

        if (workspaceId) {
            if (throughSpace) {
                where.space = {
                    workspace: {
                        id: workspaceId,
                    },
                };
            } else {
                where.workspaceId = workspaceId;
            }
        }

        return this.listsRepository.find({
            where,
            relations: ["listStages"],
            order: {
                createdAt: "ASC",
                listStages: {
                    order: "ASC",
                },
            },
        });
    }

    async findOne(id: number): Promise<List> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "list",
            id,
            PermissionLevel.VIEWER
        );

        const list = await this.listsRepository.findOne({
            where: {
                id,
            },
            relations: ["listStages"],
            order: {
                listStages: {
                    order: "ASC",
                    createdAt: "DESC",
                },
            },
        });

        if (!list) {
            throw new NotFoundException(`List with ID ${id} not found`);
        }

        return list;
    }

    async create(createListDto: CreateListDto): Promise<List> {
        const list = this.listsRepository.create(createListDto);
        await this.listsRepository.save(list);

        await this.listSideEffectsService.postCreate(list);

        return list;
    }

    async update(id: number, updateListDto: UpdateListDto): Promise<List> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "list",
            id,
            PermissionLevel.EDITOR
        );

        const list = await this.findOne(id);

        this.listsRepository.merge(list, updateListDto);
        return this.listsRepository.save(list);
    }

    async batchUpdate(
        where: FindOptionsWhere<List>,
        updateListDto: UpdateListDto
    ): Promise<UpdateResult> {
        return this.listsRepository.update(where, updateListDto);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "list",
            id,
            PermissionLevel.EDITOR
        );

        const list = await this.findOne(id);
        await this.listsRepository.softRemove(list);
    }
}
