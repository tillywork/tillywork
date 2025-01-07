import { Injectable } from "@nestjs/common";
import { CardType } from "./card.type.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { Repository } from "typeorm";
import { CardTypeFieldsFactory } from "./card.type.fields.factory";

@Injectable()
export class CardTypesSideEffectsService {
    constructor(
        @InjectRepository(Workspace)
        private workspacesRepo: Repository<Workspace>,
        private cardTypeFieldsFactory: CardTypeFieldsFactory
    ) {}

    async postCreate({ cardType }: { cardType: CardType }): Promise<CardType> {
        if (cardType.createdByType === "system") {
            cardType.workspace = await this.workspacesRepo.findOne({
                where: {
                    id: cardType.workspace.id,
                },
            });

            await this.cardTypeFieldsFactory.createFields(cardType);
        }

        return cardType;
    }
}
