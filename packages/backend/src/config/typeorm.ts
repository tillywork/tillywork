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
import { CreateCardTypeTable1718017084847 } from "../migrations/1718017084847-create-card-type-table";
import { AddDefaultCardTypeIdColumnToListTable1718019537173 } from "../migrations/1718019537173-add-defaultCardTypeId-column-to-list-table";
import { AddTypeColumnToCardTable1718019963207 } from "../migrations/1718019963207-add-type-column-to-card-table";
import { DeleteDefaultListGroups1718022901852 } from "../migrations/1718022901852-delete-default-list-groups";
import { AddDefaultCardTypeToWorkspaceTable1718184687469 } from "../migrations/1718184687469-add-defaultCardType-to-workspace-table";
import { RenamePropTableToFields1718818041867 } from "../migrations/1718818041867-rename-prop-table-to-fields";
import { AddIgnoreCompletedColumnToViewTable1719224538052 } from "../migrations/1719224538052-add-ignoreCompleted-column-to-view-table";
import { CreateIndices1719422621473 } from "../migrations/1719422621473-create-indices";
import { AddInviteCodeToProjectTable1719829250591 } from "../migrations/1719829250591-add-invite-code-to-project-table";
import { FillDefaultCardTypeIdInNewWorkspaces1719841537242 } from "../migrations/1719841537242-fill-defaultCardTypeId-in-new-workspaces";
import { ResetListGroups1719846270867 } from "../migrations/1719846270867-reset-list-groups";
import { AddParentAndChildrenColumnsToCardsTable1720077323722 } from "../migrations/1720077323722-add-parent-and-children-columns-to-cards-table";
import { CreateFileTable1720019365225 } from "../migrations/1720019365225-create-file-table";
import { AddUserUploadLimitToProjectTable1720038998374 } from "../migrations/1720038998374-add-user-upload-limit-to-project-table";
import { AddProjectIdToUserTable1720082507515 } from "../migrations/1720082507515-add-projectId-to-user-table";
import { AddIconAndIconColorColumnsToSpaceAndListTables1720414956770 } from "../migrations/1720414956770-add-icon-and-iconColor-columns-to-space-and-list-tables";
import { AddIgnoreChildrenToViewTable1720514522438 } from "../migrations/1720514522438-add-ignore-children-to-view-table";
import { CreateListFieldsTable1720527075305 } from "../migrations/1720527075305-create-list-fields-table";
import { AddWorkspaceIdToCardTable1721207599200 } from "../migrations/1721207599200-add-workspaceId-to-card-table";
import { AddCardTypeIdToFieldTable1721214304859 } from "../migrations/1721214304859-add-cardTypeId-to-field-table";
import { UpdateFilterWhereColumnForViews1721641078360 } from "../migrations/1721641078360-update-filter-where-column-for-views";
import { CreateEmailTable1721766012987 } from "../migrations/1721766012987-create-email-table";
import { AddWorkspaceIdToListTable1721829339753 } from "../migrations/1721829339753-add-workspaceId-to-list-table";
import { AddSlugToFieldTable1722503000613 } from "../migrations/1722503000613-add-slug-to-field-table";
import { AddIsTitleAndIsPhotoToFieldTable1722852559605 } from "../migrations/1722852559605-add-isTitle-and-isPhoto-to-field-table";
import { RenameCardTypeColumnInFieldTable1722854552647 } from "../migrations/1722854552647-rename-cardType-column-in-field-table";
import { MigrateTitleDescriptionAndDueAtToDataColumnInCardTable1722869332518 } from "../migrations/1722869332518-migrate-title-description-and-dueAt-to-data-column-in-card-table";
import { AddFieldIdAndFilterToListGroupTable1723106937425 } from "../migrations/1723106937425-add-fieldId-and-filter-to-list-group-table";
import { AddOptionsToViewTable1723129297915 } from "../migrations/1723129297915-add-options-to-view-table";
import { AddDeletedAtToListTable1724584476422 } from "../migrations/1724584476422-add-deletedAt-to-list-table";
import { AddEmailOpenTrackingToEmailTable1724673051203 } from "../migrations/1724673051203-add-email-open-tracking-to-email-table";
import { AddColumnsToOptionsColumnInViewTable1724762987440 } from "../migrations/1724762987440-add-columns-to-options-column-in-view-table";
import { MigrateCardUsersToDataColumn1725792730053 } from "../migrations/1725792730053-migrate-card-users-to-data-column";
import { FixDescriptionAndDueAtFields1726391466764 } from "../migrations/1726391466764-fix-description-and-due-at-fields";
import { ResetViewsWithAssigneeGroupBy1726493876246 } from "../migrations/1726493876246-reset-views-with-assignee-group-by";
import { CreateAccessControlTable1733140447674 } from "../migrations/1733140447674-create-access-control-table";
import { SeedInitAccessControls1733140464829 } from "../migrations/1733140464829-seed-init-access-controls";
import { AddAccessTypeToWorkspaceSpaceListAndCardTables1733166524606 } from "../migrations/1733166524606-add-access-type-to-workspace-space-list-and-card-tables";
import { AddTypeColumnToListTable1729608774525 } from "../migrations/1729608774525-add-type-column-to-list-table";
import { AddLayoutToCardTypesTable1731493105407 } from "src/migrations/1731493105407-add-layout-to-card-types-table";
import { MakeListStageIdNullableInCardListTable1731495327851 } from "src/migrations/1731495327851-make-list-stage-id-nullable-in-card-list-table";
import { AddSlugToListTable1732707580057 } from "src/migrations/1732707580057-add-slug-to-list-table";
import { TruncateCardActivities1734112779468 } from "src/migrations/1734112779468-truncate-card-activities";

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
    CreateCardTypeTable1718017084847,
    AddDefaultCardTypeIdColumnToListTable1718019537173,
    AddTypeColumnToCardTable1718019963207,
    DeleteDefaultListGroups1718022901852,
    AddDefaultCardTypeToWorkspaceTable1718184687469,
    RenamePropTableToFields1718818041867,
    AddIgnoreCompletedColumnToViewTable1719224538052,
    CreateIndices1719422621473,
    AddInviteCodeToProjectTable1719829250591,
    FillDefaultCardTypeIdInNewWorkspaces1719841537242,
    ResetListGroups1719846270867,
    AddParentAndChildrenColumnsToCardsTable1720077323722,
    CreateFileTable1720019365225,
    AddUserUploadLimitToProjectTable1720038998374,
    AddProjectIdToUserTable1720082507515,
    AddIconAndIconColorColumnsToSpaceAndListTables1720414956770,
    AddIgnoreChildrenToViewTable1720514522438,
    CreateListFieldsTable1720527075305,
    AddWorkspaceIdToCardTable1721207599200,
    AddCardTypeIdToFieldTable1721214304859,
    UpdateFilterWhereColumnForViews1721641078360,
    CreateEmailTable1721766012987,
    AddWorkspaceIdToListTable1721829339753,
    AddSlugToFieldTable1722503000613,
    AddIsTitleAndIsPhotoToFieldTable1722852559605,
    RenameCardTypeColumnInFieldTable1722854552647,
    MigrateTitleDescriptionAndDueAtToDataColumnInCardTable1722869332518,
    AddFieldIdAndFilterToListGroupTable1723106937425,
    AddOptionsToViewTable1723129297915,
    AddDeletedAtToListTable1724584476422,
    AddEmailOpenTrackingToEmailTable1724673051203,
    AddColumnsToOptionsColumnInViewTable1724762987440,
    MigrateCardUsersToDataColumn1725792730053,
    FixDescriptionAndDueAtFields1726391466764,
    ResetViewsWithAssigneeGroupBy1726493876246,
    CreateAccessControlTable1733140447674,
    SeedInitAccessControls1733140464829,
    AddAccessTypeToWorkspaceSpaceListAndCardTables1733166524606,
    AddTypeColumnToListTable1729608774525,
    AddLayoutToCardTypesTable1731493105407,
    MakeListStageIdNullableInCardListTable1731495327851,
    AddSlugToListTable1732707580057,
    TruncateCardActivities1734112779468,
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
    migrationsTransactionMode: "each",
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
