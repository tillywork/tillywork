import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { View } from "./view.entity";
import { CreateViewDto } from "./dto/create.view.dto";
import { UpdateViewDto } from "./dto/update.view.dto";
import { ClsService } from "nestjs-cls";
import { AccessControlService } from "../auth/services/access.control.service";
import { ListGroupOptions, PermissionLevel } from "@tillywork/shared";
import { List } from "../lists/list.entity";

@Injectable()
export class ViewsService {
    constructor(
        @InjectRepository(View)
        private viewsRepository: Repository<View>,
        private clsService: ClsService,
        private accessControlService: AccessControlService
    ) {}

    async findAll({ listId }: { listId: number }): Promise<View[]> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            listId,
            PermissionLevel.VIEWER
        );

        return this.viewsRepository.find({
            where: {
                list: {
                    id: listId,
                },
            },
            order: {
                createdAt: "asc",
            },
        });
    }

    async findOne(id: number): Promise<View> {
        const user = this.clsService.get("user");
        const view = await this.viewsRepository.findOne({ where: { id } });

        if (!view) {
            throw new NotFoundException(`View with ID ${id} not found`);
        }

        await this.accessControlService.authorize(
            user,
            "list",
            view.listId,
            PermissionLevel.VIEWER
        );

        return view;
    }

    async create(createViewDto: CreateViewDto): Promise<View> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "list",
            createViewDto.listId,
            PermissionLevel.EDITOR
        );

        const list = await this.viewsRepository.manager
            .getRepository(List)
            .findOne({
                where: {
                    id: createViewDto.listId,
                },
                relations: ["listStages"],
            });

        const view = this.viewsRepository.create({
            options: {
                groupBy: {
                    type: list.listStages?.length
                        ? ListGroupOptions.LIST_STAGE
                        : ListGroupOptions.ALL,
                },
            },
            ...createViewDto,
        });
        return this.viewsRepository.save(view);
    }

    async update(id: number, updateViewDto: UpdateViewDto): Promise<View> {
        const user = this.clsService.get("user");
        const view = await this.findOne(id);

        await this.accessControlService.authorize(
            user,
            "list",
            view.listId,
            PermissionLevel.EDITOR
        );

        this.viewsRepository.merge(view, updateViewDto);
        return this.viewsRepository.save(view);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");
        const view = await this.findOne(id);

        await this.accessControlService.authorize(
            user,
            "list",
            view.listId,
            PermissionLevel.EDITOR
        );

        await this.viewsRepository.remove(view);
    }
}
