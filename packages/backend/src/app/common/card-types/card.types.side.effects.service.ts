import { Injectable, Logger } from "@nestjs/common";
import { CardType } from "./card.type.entity";
import { FieldsService } from "../fields/fields.service";
import { FieldTypes, WorkspaceTypes } from "@tillywork/shared";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { Repository } from "typeorm";

@Injectable()
export class CardTypesSideEffectsService {
    constructor(
        private fieldsService: FieldsService,
        @InjectRepository(Workspace)
        private workspacesRepo: Repository<Workspace>
    ) {}

    async postCreate({ cardType }: { cardType: CardType }): Promise<CardType> {
        if (cardType.createdByType === "system") {
            cardType.workspace = await this.workspacesRepo.findOne({
                where: {
                    id: cardType.workspace.id,
                },
            });

            cardType = await this.createDefaultFields({ cardType });
        }

        return cardType;
    }

    async createDefaultFields({
        cardType,
    }: {
        cardType: CardType;
    }): Promise<CardType> {
        const defaultPmFields = [
            {
                name: "Title",
                slug: "title",
                type: FieldTypes.RICH,
                isTitle: true,
                icon: "mdi-text-recognition",
                required: true,
            },
            {
                name: "Description",
                type: FieldTypes.RICH,
                slug: "description",
                icon: "mdi-text-box",
                isDescription: true,
            },
            {
                name: "Assignee",
                type: FieldTypes.USER,
                slug: "assignee",
                icon: "mdi-account",
                isPinned: true,
                isAssignee: true,
            },
            {
                name: "Due At",
                type: FieldTypes.DATE,
                slug: "due_at",
                icon: "mdi-calendar",
                isPinned: true,
            },
            {
                name: "Starts At",
                type: FieldTypes.DATE,
                slug: "starts_at",
                icon: "mdi-calendar",
            },
        ];

        const defaultContactFields = [
            {
                name: "First Name",
                type: FieldTypes.TEXT,
                slug: "first_name",
                icon: "mdi-text-account",
            },
            {
                name: "Last Name",
                type: FieldTypes.TEXT,
                slug: "last_name",
                icon: "mdi-text-account",
            },
            {
                name: "Email",
                type: FieldTypes.EMAIL,
                slug: "email",
                icon: "mdi-email",
            },
            {
                name: "Lead Stage",
                type: FieldTypes.DROPDOWN,
                slug: "lead_stage",
                icon: "mdi-circle-slice-8",
                items: [
                    {
                        item: "Lead",
                        color: "default",
                    },
                    {
                        item: "Qualified",
                        color: "success",
                    },
                    {
                        item: "Demo",
                        color: "success",
                    },
                    {
                        item: "Proposal",
                        color: "success",
                    },
                    {
                        item: "Negotiations",
                        color: "success",
                    },
                    {
                        item: "Won",
                        color: "success",
                    },
                    {
                        item: "Lost",
                        color: "error",
                    },
                ],
            },
        ];

        const defaultOrganizationFields = [
            {
                name: "Name",
                type: FieldTypes.TEXT,
                slug: "name",
                icon: "mdi-domain",
                isTitle: true,
            },
        ];

        const defaultDealFields = [
            {
                name: "Name",
                type: FieldTypes.TEXT,
                slug: "name",
                icon: "mdi-domain",
                isTitle: true,
            },
            {
                name: "Value",
                type: FieldTypes.CURRENCY,
                slug: "value",
                icon: "mdi-currency-usd",
                isPinned: true,
            },
        ];

        let defaultFields;

        switch (cardType.workspace.type) {
            case WorkspaceTypes.CRM: {
                switch (cardType.name) {
                    case "Organization":
                        defaultFields = defaultOrganizationFields;
                        break;

                    case "Deal":
                        defaultFields = defaultDealFields;
                        break;

                    case "Contact":
                    default:
                        defaultFields = defaultContactFields;
                }
                break;
            }

            case WorkspaceTypes.PROJECT_MANAGEMENT:
            default:
                defaultFields = defaultPmFields;
        }

        cardType.fields = await Promise.all(
            defaultFields.map((field) => {
                return this.fieldsService.create({
                    ...field,
                    workspaceId: cardType.workspace.id,
                    cardTypeId: cardType.id,
                });
            })
        );

        return cardType;
    }
}
