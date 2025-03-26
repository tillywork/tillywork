import { Inject, Logger } from "@nestjs/common";

import { Card } from "../../cards/card.entity";
import { Space } from "../../spaces/space.entity";
import { List } from "../../lists/list.entity";

import {
    AutomationFieldOption,
    AutomationFieldSchema,
    AutomationHandlerDefinition,
    AutomationHandlerMetadata,
    GetHandlerFieldsParams,
} from "@tillywork/shared";
import { AclContext } from "../../auth/context/acl.context";
import { ListsService } from "../../lists/lists.service";
import { AutomationHandlerRegistry } from "../registries/automation.handler.registry";
import { isActionType, isTriggerType } from "../helpers/handler.type.helper";
import { AutomationsService } from "../services/automations.service";
import { CardsService } from "../../cards/cards.service";
import { FieldsService } from "../../fields/fields.service";
import { Field } from "../../fields/field.entity";
import { Automation } from "../entities/automation.entity";
import { User } from "../../users/user.entity";
import { AccessControlService } from "../../auth/services/access.control.service";

export interface AutomationContext {
    automation?: Automation;
    card?: Card;
    list?: List;
    space?: Space;
}

export interface AutomationHandler {
    readonly metadata: AutomationHandlerMetadata;
    readonly fields: Record<string, AutomationFieldSchema>;
    execute(payload: any, context: AutomationContext): Promise<any>;
    getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>>;
    getCardFields(automationId): Promise<Field[]>;
    getAutomationLists(context: AutomationContext): Promise<List[]>;
    getSampleData(...params: any[]): Promise<Record<string, any>>;
    getListUsers(context: AutomationContext): Promise<User[]>;
}

export abstract class BaseAutomationHandler implements AutomationHandler {
    protected readonly logger: Logger;
    readonly metadata: AutomationHandlerMetadata;
    readonly fields: Record<string, AutomationFieldSchema>;
    @Inject()
    protected readonly aclContext: AclContext;
    @Inject()
    protected readonly accessControlService: AccessControlService;
    @Inject()
    protected readonly listsService: ListsService;
    @Inject()
    private readonly registry: AutomationHandlerRegistry;
    @Inject()
    protected readonly automationsService: AutomationsService;
    @Inject()
    protected readonly cardsService: CardsService;
    @Inject()
    protected readonly fieldsService: FieldsService;

    constructor(definition: AutomationHandlerDefinition) {
        this.metadata = definition.metadata;
        this.fields = definition.fields || {};
        this.logger = new Logger(this.metadata.title);
    }

    onModuleInit() {
        if (isTriggerType(this.metadata.value)) {
            this.registry.registerTrigger(this.metadata.value, this);
        } else if (isActionType(this.metadata.value)) {
            this.registry.registerAction(this.metadata.value, this);
        } else {
            throw Error(`Unknown handler type: ${this.metadata.value}`);
        }
    }

    abstract execute(payload: any, context: AutomationContext): Promise<any>;

    async getFields(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        return this.fields;
    }

    /**
     * Retrieves the card field for locations the automation is in. Sorted by required first, and A-Z.
     * @param automationId
     * @returns array of fields
     */
    async getCardFields(automationId: any): Promise<Field[]> {
        const automation = await this.automationsService.findOne(automationId);
        const activeLists = await this.getAutomationLists({ automation });

        const cardTypes = Array.from(
            new Map(
                activeLists.map((list) => [
                    list.defaultCardType.id,
                    list.defaultCardType,
                ])
            ).values()
        );

        const [cardTypeFields, listFields] = await Promise.all([
            Promise.all(
                cardTypes.map((cardType) =>
                    this.fieldsService.findAll({ cardTypeId: cardType.id })
                )
            ),
            Promise.all(
                activeLists.map((list) =>
                    this.fieldsService.findAll({ listId: list.id })
                )
            ),
        ]);

        const fields = [...cardTypeFields.flat(), ...listFields.flat()];

        fields.sort((a, b) => {
            if (a.required !== b.required) {
                return a.required ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        return fields;
    }

    async getAutomationLists({
        automation,
    }: AutomationContext): Promise<List[]> {
        const lists: List[] = [];

        for (const location of automation.locations) {
            if (location.locationType === "list") {
                lists.push(location.location as List);
            } else {
                const spaceLists = await this.aclContext.run(true, () => {
                    return this.listsService.findAll({
                        spaceId: location.locationId,
                    });
                });
                lists.push(...spaceLists);
            }
        }

        return lists;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getSampleData(...params: any[]): Promise<Record<string, any>> {
        return {};
    }

    async getListUsers({ automation }: AutomationContext): Promise<User[]> {
        const lists = await this.getAutomationLists({ automation });
        const usersWithAccess = await this.accessControlService.findAll({
            resourceType: "list",
            resourceId: lists.map((l) => l.id),
        });

        return usersWithAccess.map((u) => u.user);
    }

    async getListUsersAsFieldOptions({
        automation,
    }: AutomationContext): Promise<AutomationFieldOption[]> {
        const usersWithAccess = await this.getListUsers({ automation });

        return usersWithAccess.map((u) => ({
            title: `${u.firstName} ${u.lastName}`,
            value: u.id,
            photo: u.photo,
            avatar: true,
        }));
    }
}
