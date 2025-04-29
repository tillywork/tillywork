import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationPreference } from "./notification.preference.entity";
import { UpsertNotificationPreferenceDto } from "./dto/upsert.notification.preference.dto";
import { NotificationChannel } from "@tillywork/shared";

@Injectable()
export class NotificationPreferenceService {
    constructor(
        @InjectRepository(NotificationPreference)
        private readonly prefRepo: Repository<NotificationPreference>
    ) {}

    async findAll(userId: number) {
        return this.prefRepo.find({
            where: {
                user: {
                    id: userId,
                },
            },
        });
    }

    async findOne({
        userId,
        channel,
    }: {
        userId: number;
        channel: NotificationChannel;
    }) {
        return this.prefRepo.findOne({
            where: {
                user: {
                    id: userId,
                },
                channel,
            },
        });
    }

    async upsert(userId: number, dto: UpsertNotificationPreferenceDto) {
        let pref = await this.prefRepo.findOne({
            where: {
                user: {
                    id: userId,
                },
                channel: dto.channel,
            },
        });

        if (!pref) {
            pref = this.prefRepo.create({
                user: {
                    id: userId,
                },
                channel: dto.channel,
            });
        }

        pref.enabled = dto.enabled;
        pref.config = dto.config ?? {};

        return this.prefRepo.save(pref);
    }

    async isInAppEnabled(userId: number): Promise<boolean> {
        const pref = await this.prefRepo.findOne({
            where: {
                user: { id: userId },
                channel: NotificationChannel.IN_APP,
            },
        });

        return pref ? pref.enabled : true;
    }

    async isSlackEnabled(userId: number): Promise<boolean> {
        const pref = await this.prefRepo.findOne({
            where: {
                user: { id: userId },
                channel: NotificationChannel.SLACK,
            },
        });

        return pref ? pref.enabled : false;
    }
}
