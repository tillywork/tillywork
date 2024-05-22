import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { TypeOrmLoggerContainer } from "../app/common/logger/typeorm.logger.container";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
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
];

const config: TypeOrmModuleOptions = {
    type: "postgres",
    host: `${process.env.TW_DB_HOST}`,
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
    ssl: process.env.NODE_ENV === "production" ? true : false,
    extra:
        process.env.NODE_ENV === "production"
            ? {
                  ssl: {
                      rejectUnauthorized: false,
                  },
              }
            : undefined,
};

export default registerAs("typeorm", () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
