import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { config as dotenvConfig } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { TypeOrmLoggerContainer } from "../app/common/logger/typeorm.logger.container";
import { CreateUserTable1716293040055 } from "../migrations/1716293040055-create-user-table";
import { CreateProjectTable1716293121622 } from "../migrations/1716293121622-create-project-table";
import { CreateWorkspaceTable1716293265171 } from "../migrations/1716293265171-create-workspace-table";
import { CreateSpaceTable1716296651114 } from "../migrations/1716296651114-create-space-table";
import { CreateListTable1716296739540 } from "../migrations/1716296739540-create-list-table";
import { CreateListGroupTable1716296857512 } from "../migrations/1716296857512-create-list-group-table";
import { CreateListStageTable1716297055178 } from "../migrations/1716297055178-create-list-stage-table";
import { CreateFilterTable1716298681881 } from "../migrations/1716298681881-create-filter-table";
import { CreateCardTable1716298776371 } from "../migrations/1716298776371-create-card-table";
import { CreateCardListTable1716298856999 } from "../migrations/1716298856999-create-card-list-table";
import { CreateCardActivityTable1716298912783 } from "../migrations/1716298912783-create-card-activity-table";
import { CreateViewTable1716299003967 } from "../migrations/1716299003967-create-view-table";
import { CreatePropTable1716299140812 } from "../migrations/1716299140812-create-prop-table";
import { DeleteUserGroups1716372393939 } from "../migrations/1716372393939-delete-user-groups";
import { AddOrderColumnToListGroups1716455762784 } from "../migrations/1716455762784-add-order-column-to-list-groups";
import { AddOrderColumnToCardListsTable1716798868594 } from "../migrations/1716798868594-add-order-column-to-card-lists-table";
import { AddCreatedAtUpdatedAtToCardListTable1716883730399 } from "../migrations/1716883730399-add-createdAt-updatedAt-to-card-list-table";
import { AddListViewType1717363107808 } from "../migrations/1717363107808-add-list-view-type";
import { AddStartsAtColumnToCardsTable1717406725195 } from "../migrations/1717406725195-add-starts-at-column-to-cards-table";

dotenvConfig({ path: "../../.env" });

const migrations = [
    CreateUserTable1716293040055,
    CreateProjectTable1716293121622,
    CreateWorkspaceTable1716293265171,
    CreateSpaceTable1716296651114,
    CreateListTable1716296739540,
    CreateListGroupTable1716296857512,
    CreateListStageTable1716297055178,
    CreateFilterTable1716298681881,
    CreateCardTable1716298776371,
    CreateCardListTable1716298856999,
    CreateCardActivityTable1716298912783,
    CreateViewTable1716299003967,
    CreatePropTable1716299140812,
    DeleteUserGroups1716372393939,
    AddOrderColumnToListGroups1716455762784,
    AddOrderColumnToCardListsTable1716798868594,
    AddCreatedAtUpdatedAtToCardListTable1716883730399,
    AddListViewType1717363107808,
    AddStartsAtColumnToCardsTable1717406725195,
];

const config: TypeOrmModuleOptions = {
    type: "postgres",
    host: `${process.env.TW_DB_HOST}`,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    port: +process.env.TW_DB_PORT!,
    username: `${process.env.TW_DB_USERNAME}`,
    password: `${process.env.TW_DB_PASSWORD}`,
    database: `${process.env.TW_DB_NAME}`,
    migrations,
    migrationsRun: true,
    migrationsTransactionMode: "all",
    autoLoadEntities: true,
    logger:
        process.env.TW_ENABLE_QUERY_LOGGING !== "false"
            ? TypeOrmLoggerContainer.ForConnection(true)
            : undefined,
    ssl: process.env.TW_DB_ENABLE_SSL === "true" ? true : false,
    extra:
        process.env.TW_DB_ENABLE_SSL === "true"
            ? {
                  ssl: {
                      rejectUnauthorized: false,
                  },
              }
            : undefined,
};

export default registerAs("typeorm", () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
