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
    Like,
    Not,
    Repository,
    UpdateResult,
} from "typeorm";
import { List } from "./list.entity";
import { CreateListDto } from "./dto/create.list.dto";
import { UpdateListDto } from "./dto/update.list.dto";
import { ListSideEffectsService } from "./list.side.effects.service";
import { ClsService } from "nestjs-cls";
import { AccessControl } from "../auth/entities/access.control.entity";
import { PermissionLevel } from "@tillywork/shared";
import { AccessControlService } from "../auth/services/access.control.service";
import slugify from "slugify";
import { Space } from "../spaces/space.entity";
import { AclContext } from "../auth/context/acl.context";

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
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService,
        private clsService: ClsService,
        private aclContext: AclContext
    ) {}

    async findAll({
        spaceId,
        workspaceId,
        throughSpace,
    }: FindAllParams): Promise<List[]> {
        const user = this.clsService.get("user");
        const where: FindOptionsWhere<List> = {};

        if (!this.aclContext.shouldSkipAcl()) {
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

            const accessibleListIds = accessControlEntries.map(
                (entry) => entry.list as unknown as number
            );

            where.id = In(accessibleListIds);
        }

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

        if (!this.aclContext.shouldSkipAcl()) {
            await this.accessControlService.authorize(
                user,
                "list",
                id,
                PermissionLevel.VIEWER
            );
        }

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
        const slug = await this.slugifyListName(createListDto);

        const list = this.listsRepository.create({
            ...createListDto,
            slug,
        });

        await this.listsRepository.save(list);
        await this.accessControlService.applyResourceAccess(list, "list");
        await this.listSideEffectsService.postCreate({
            list,
            defaultViewType: createListDto.defaultViewType,
            createDefaultStages: createListDto.createDefaultStages,
        });

        return list;
    }

    async update(id: number, updateListDto: UpdateListDto): Promise<List> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
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

        await this.accessControlService.authorize(
            user,
            "list",
            id,
            PermissionLevel.EDITOR
        );

        const list = await this.findOne(id);
        await this.listsRepository.softRemove(list);
    }

    async slugifyListName({
        name,
        workspaceId,
        spaceId,
    }: {
        name: string;
        workspaceId?: number;
        spaceId?: number;
    }) {
        let resolvedWorkspaceId = workspaceId;
        let slug = slugify(name, { lower: true, strict: true });

        if (!resolvedWorkspaceId && spaceId) {
            const space = await this.listsRepository.manager.findOne(Space, {
                where: { id: spaceId },
                select: ["workspaceId"],
            });

            if (space) {
                resolvedWorkspaceId = space.workspaceId;
            }
        }

        if (!resolvedWorkspaceId) {
            return slug;
        }

        const existingSlugs = await this.listsRepository.find({
            where: {
                spaceId: spaceId,
                workspace: {
                    id: workspaceId,
                },
                slug: Like(`${slug}%`),
            },
            select: ["slug"],
        });

        if (existingSlugs.length === 0) {
            return slug;
        }

        const matchingExistingSlugs = existingSlugs
            .map((existingSlug) => {
                const parts = existingSlug.slug.split("-");
                if (parts.length > 1) {
                    const lastPart = parts[parts.length - 1];
                    const num = parseInt(lastPart);
                    return !isNaN(num) ? num : null;
                }
                return null;
            })
            .filter((num) => num !== null);

        const nextNumber =
            matchingExistingSlugs.length > 0
                ? Math.max(...matchingExistingSlugs) + 1
                : 1;

        slug = `${slug}-${nextNumber}`;

        return slug;
    }
}
