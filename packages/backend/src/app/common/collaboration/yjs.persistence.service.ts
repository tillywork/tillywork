import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Y from "yjs";
import { Redis } from "ioredis";

@Injectable()
export class YjsPersistenceService {
    private redis: Redis;

    constructor(private readonly configService: ConfigService) {
        this.redis = new Redis({
            host: this.configService.get<string>("TW_REDIS_HOST"),
            port: this.configService.get<number>("TW_REDIS_PORT"),
        });
    }

    async loadDocument(docName: string): Promise<Y.Doc | null> {
        const data = await this.redis.get(`yjs:${docName}`);
        if (data) {
            const doc = new Y.Doc();
            Y.applyUpdate(doc, Buffer.from(data, "base64"));
            return doc;
        }
        return null;
    }

    async saveDocument(docName: string, doc: Y.Doc): Promise<void> {
        const update = Y.encodeStateAsUpdate(doc);
        await this.redis.set(
            `yjs:${docName}`,
            Buffer.from(update).toString("base64")
        );
    }
}
