import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldTypes, WorkspaceTypes } from "@tillywork/shared";
import { Repository } from "typeorm";
import { FieldsService } from "../fields/fields.service";
import { CardType } from "./card.type.entity";

interface FieldDefinition {
    name: string;
    type: FieldTypes;
    slug: string;
    icon: string;
    isTitle?: boolean;
    isDescription?: boolean;
    isAssignee?: boolean;
    isPinned?: boolean;
    items?: { item: string }[];
    dataCardTypeName?: string;
    required?: boolean;
}

@Injectable()
export class CardTypeFieldsFactory {
    constructor(
        private fieldsService: FieldsService,
        @InjectRepository(CardType)
        private cardTypesRepo: Repository<CardType>
    ) {}

    private readonly pmFields: FieldDefinition[] = [
        {
            name: "Title",
            slug: "title",
            type: FieldTypes.TEXT,
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
            type: FieldTypes.DATETIME,
            slug: "due_at",
            icon: "mdi-calendar",
            isPinned: true,
        },
        {
            name: "Starts At",
            type: FieldTypes.DATETIME,
            slug: "starts_at",
            icon: "mdi-calendar",
        },
    ];

    private readonly contactFields: FieldDefinition[] = [
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
            name: "Job Title",
            type: FieldTypes.TEXT,
            slug: "job_title",
            icon: "mdi-briefcase",
        },
        {
            name: "Organization",
            type: FieldTypes.CARD,
            slug: "organization",
            icon: "mdi-domain",
            dataCardTypeName: "Organization",
        },
        {
            name: "Lead Stage",
            type: FieldTypes.DROPDOWN,
            slug: "lead_stage",
            icon: "mdi-circle-slice-8",
            isPinned: true,
            items: [
                { item: "New Lead" },
                { item: "Engaged" },
                { item: "Qualified Lead" },
                { item: "Contacted" },
                { item: "Nurture" },
                { item: "Customer" },
                { item: "Unqualified" },
                { item: "Bad timing" },
            ],
        },
    ];

    private readonly organizationFields: FieldDefinition[] = [
        {
            name: "Name",
            type: FieldTypes.TEXT,
            slug: "name",
            icon: "mdi-domain",
            isTitle: true,
        },
        {
            name: "Website",
            type: FieldTypes.URL,
            slug: "website",
            icon: "mdi-web",
        },
        {
            name: "Establishment Year",
            type: FieldTypes.NUMBER,
            slug: "establishment_year",
            icon: "mdi-calendar-range",
        },
        {
            name: "Annual Revenue",
            type: FieldTypes.CURRENCY,
            slug: "annual_revenue",
            icon: "mdi-currency-usd",
        },
    ];

    private readonly dealFields: FieldDefinition[] = [
        {
            name: "Name",
            type: FieldTypes.TEXT,
            slug: "name",
            icon: "mdi-handshake",
            isTitle: true,
            required: true,
        },
        {
            name: "Owner",
            type: FieldTypes.USER,
            slug: "owner",
            icon: "mdi-account",
            isPinned: true,
            isAssignee: true,
        },
        {
            name: "Value",
            type: FieldTypes.CURRENCY,
            slug: "value",
            icon: "mdi-currency-usd",
            isPinned: true,
        },
        {
            name: "Expected Close Date",
            type: FieldTypes.DATE,
            slug: "expected_close_date",
            icon: "mdi-draw",
        },
        {
            name: "Closing Probability",
            type: FieldTypes.PERCENTAGE,
            slug: "closing_probability",
            icon: "mdi-speedometer",
        },
        {
            name: "Organization",
            type: FieldTypes.CARD,
            slug: "organization",
            icon: "mdi-domain",
            isPinned: true,
            dataCardTypeName: "Organization",
        },
    ];

    private getFieldsForCardType(cardType: CardType): FieldDefinition[] {
        if (cardType.workspace.type === WorkspaceTypes.CRM) {
            switch (cardType.name) {
                case "Organization":
                    return this.organizationFields;
                case "Deal":
                    return this.dealFields;
                case "Contact":
                default:
                    return this.contactFields;
            }
        }
        return this.pmFields;
    }

    async createFields(cardType: CardType): Promise<void> {
        const fields = this.getFieldsForCardType(cardType);

        for (const field of fields) {
            let dataCardType;

            if (field.dataCardTypeName) {
                dataCardType = await this.cardTypesRepo.findOne({
                    where: {
                        name: field.dataCardTypeName,
                        workspace: {
                            id: cardType.workspace.id,
                        },
                    },
                });
            }

            await this.fieldsService.create({
                ...field,
                workspaceId: cardType.workspace.id,
                cardTypeId: cardType.id,
                dataCardTypeId: dataCardType?.id,
            });
        }
    }
}
