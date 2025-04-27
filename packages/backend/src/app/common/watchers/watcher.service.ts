import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Watcher } from "./watcher.entity";
import { WatchableResourceType } from "@tillywork/shared";
import { CreateWatcherDto } from "./dto/create.watcher.dto";
import { User } from "../users/user.entity";

@Injectable()
export class WatcherService {
    constructor(
        @InjectRepository(Watcher)
        private readonly watcherRepository: Repository<Watcher>
    ) {}

    async addWatcher({
        userId,
        resourceType,
        resourceId,
    }: CreateWatcherDto): Promise<Watcher> {
        const existing = await this.watcherRepository.findOne({
            where: {
                user: { id: userId },
                resourceType,
                resourceId,
            },
            relations: ["user"],
        });

        if (existing) {
            return existing;
        }

        const watcher = this.watcherRepository.create({
            user: { id: userId },
            resourceType,
            resourceId,
        });

        return this.watcherRepository.save(watcher);
    }

    async removeWatcher({
        userId,
        resourceType,
        resourceId,
    }: {
        userId: number;
        resourceType: WatchableResourceType;
        resourceId: number;
    }): Promise<boolean> {
        const result = await this.watcherRepository.delete({
            user: { id: userId },
            resourceType,
            resourceId,
        });

        return result.affected !== undefined && result.affected > 0;
    }

    async findWatchers({
        resourceType,
        resourceId,
    }: {
        resourceType: WatchableResourceType;
        resourceId: number;
    }): Promise<User[]> {
        const watchers = await this.watcherRepository.find({
            where: { resourceType, resourceId },
            relations: ["user"],
        });

        return watchers.map((w) => w.user);
    }

    async isWatching({
        userId,
        resourceType,
        resourceId,
    }: {
        userId: number;
        resourceType: WatchableResourceType;
        resourceId: number;
    }): Promise<boolean> {
        const count = await this.watcherRepository.count({
            where: {
                user: { id: userId },
                resourceType,
                resourceId,
            },
        });

        return count > 0;
    }
}
