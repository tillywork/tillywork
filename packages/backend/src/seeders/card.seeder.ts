import { Connection } from "typeorm";
import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";
import { ListsService } from "../app/common/lists/lists.service";
import { List } from "../app/common/lists/list.entity";
import { ListSideEffectsService } from "../app/common/lists/list.side.effects.service";
import { ListStagesService } from "../app/common/lists/list.stages.service";
import { ListStage } from "../app/common/lists/list.stage.entity";
import { ViewsService } from "../app/common/views/views.service";
import { View } from "../app/common/views/view.entity";
import { CardsService } from "../app/common/cards/cards.service";
import { Card } from "../app/common/cards/card.entity";
import { CardList } from "../app/common/cards/card.list.entity";

const logger = new Logger("UserSeeder");

export async function seedCardsData(connection: Connection): Promise<void> {
    const cardsService = new CardsService(
        connection.getRepository(Card),
        connection.getRepository(CardList)
    );
    const viewsService = new ViewsService(connection.getRepository(View));
    const listStagesService = new ListStagesService(
        connection.getRepository(ListStage)
    );
    const listSideEffectsService = new ListSideEffectsService(
        listStagesService,
        viewsService
    );
    const listsService = new ListsService(
        connection.getRepository(List),
        listSideEffectsService
    );

    logger.log("Seeding card data...");
    const list = (await listsService.findAll()).lists[0];
    logger.log({ list });
    for (let i = 0; i < 100; i++) {
        const card = await cardsService.create({
            title: faker.company.name(),
            listId: list.id,
            listStageId: faker.helpers.arrayElement(
                list.listStages.map((stage) => stage.id)
            ),
        });
        logger.log({ card });
    }
}