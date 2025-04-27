import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    Connection,
    UpdateEvent,
    MoreThanOrEqual,
    IsNull,
    Raw,
} from "typeorm";
import { Card } from "./card.entity";
import { Injectable, Logger } from "@nestjs/common";
import { diff } from "deep-object-diff";
import { ClsService } from "nestjs-cls";
import {
    ACTIVITY_FIELD_TYPES,
    ActivityType,
    FieldChange,
    getNewMentions,
    TriggerType,
    UpdateActivityContent,
} from "@tillywork/shared";
import { CardActivity } from "./card-activities/card.activity.entity";
import { Field } from "../fields/field.entity";
import { TriggerEvent } from "../automations/events/trigger.event";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NotificationAssigneeEvent } from "../notifications/events/assignee.event";
import { NotificationMentionEvent } from "../notifications/events/mention.event";

// Configuration constants
const CONFIG = {
    ACTIVITY_GROUPING_WINDOW: 1000 * 60 * 1, // 1 minute in milliseconds
    INSERTION_DELAY: 100, // Delay after insertion in milliseconds
} as const;

@Injectable()
@EventSubscriber()
export class CardSubscriber implements EntitySubscriberInterface<Card> {
    private readonly logger = new Logger("CardSubscriber");

    constructor(
        connection: Connection,
        private clsService: ClsService,
        private eventEmitter: EventEmitter2
    ) {
        connection.subscribers.push(this);
    }
    /**
     * Indicates that this subscriber only listen to Card events.
     */
    listenTo() {
        return Card;
    }

    /**
     * Called after card insertion.
     */
    async afterInsert(event: InsertEvent<Card>) {
        const activityRepo = event.manager.getRepository(CardActivity);

        await this.createInitialActivity(event, activityRepo);
        await this.handleFieldChangesForInsertion(event, activityRepo);
    }

    private async createInitialActivity(
        event: InsertEvent<Card>,
        activityRepo: any
    ) {
        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: { id: event.entity.id },
            content: {
                changes: [{ type: "created", newValue: event.entity }],
            },
            createdByType: event.entity.createdByType,
            createdBy: event.entity.createdBy,
            createdAt: event.entity.createdAt,
        });

        await activityRepo.save(activity);
    }

    private async handleFieldChangesForInsertion(
        event: InsertEvent<Card>,
        activityRepo: any
    ) {
        const changes = await this.getFieldChanges(
            {},
            event.entity.data,
            event
        );
        await new Promise((resolve) =>
            setTimeout(resolve, CONFIG.INSERTION_DELAY)
        );

        await Promise.all(
            changes.map((change) =>
                this.createFieldChangeActivity(change, event, activityRepo)
            )
        );
    }

    private async createFieldChangeActivity(
        change: FieldChange,
        event: InsertEvent<Card>,
        activityRepo: any
    ) {
        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: event.entity,
            content: { changes: [change] },
            createdByType: event.entity.createdByType,
            createdBy: event.entity.createdBy,
        });

        return activityRepo.save(activity);
    }

    async afterUpdate(event: UpdateEvent<Card>) {
        if (!this.shouldProcessUpdate(event)) return;

        const changes = await this.processDataChanges(event);
        if (!changes.length) return;

        await this.handleActivityCreation(event, changes);
    }

    private shouldProcessUpdate(event: UpdateEvent<Card>): boolean {
        return event.updatedColumns.some(
            (column) => column.propertyName === "data"
        );
    }

    private async processDataChanges(event: UpdateEvent<Card>) {
        const oldData = event.databaseEntity?.data || {};
        const newData = event.entity?.data || {};
        const changes = await this.getFieldChanges(oldData, newData, event);

        await this.emitAutomationEvents(changes, event);
        return changes;
    }

    private async emitAutomationEvents(
        changes: FieldChange[],
        event: UpdateEvent<Card>
    ) {
        for (const change of changes) {
            if (change.field) {
                this.eventEmitter.emit(
                    "automation.trigger",
                    new TriggerEvent(
                        TriggerType.FIELD_UPDATED,
                        event.entity.id,
                        change
                    )
                );
            }
        }
    }

    private async getFieldChanges(
        oldData: Record<string, any>,
        newData: Record<string, any>,
        event: UpdateEvent<Card> | InsertEvent<Card>
    ): Promise<FieldChange[]> {
        const diffResult = diff(oldData, newData);
        const user = this.clsService.get("user");
        const isAutomation = this.clsService.get("isAutomation");

        const changes = await Promise.all(
            Object.keys(diffResult).map(async (key) => {
                const field = await this.getFieldFromChangeKey(key, event);

                if (!field) {
                    this.logger.error({
                        message:
                            "No field was found while creating card activity record. ",
                        slug: key,
                        workspaceId: event.entity.workspace.id,
                    });
                    return null;
                }

                if (field.isDescription) {
                    const mentionedUserIds = getNewMentions(
                        newData[key],
                        oldData[key]
                    );

                    this.eventEmitter.emit(
                        "notification.mention",
                        new NotificationMentionEvent({
                            cardId: event.entity.id,
                            createdByType: isAutomation ? "automation" : "user",
                            createdById: isAutomation ? undefined : user.id,
                            mentionedUserIds,
                            mentionedOn: "card",
                        })
                    );
                }

                if (!ACTIVITY_FIELD_TYPES.includes(field.type)) {
                    return null;
                }

                const change: FieldChange = {
                    field: {
                        id: field.id,
                        slug: field.slug,
                    },
                    type: "updated",
                    newValue: newData[key],
                    oldValue: oldData[key],
                };

                if (field.multiple) {
                    if (Array.isArray(newData[key])) {
                        if (Array.isArray(oldData[key])) {
                            const addedItems = newData[key].filter(
                                (item) => !oldData[key].includes(item)
                            );
                            const removedItems = oldData[key].filter(
                                (item) => !newData[key].includes(item)
                            );

                            change.addedItems = addedItems.length
                                ? addedItems
                                : undefined;
                            change.removedItems = removedItems.length
                                ? removedItems
                                : undefined;
                        } else {
                            change.addedItems = newData[key];
                        }
                    } else if (Array.isArray(oldData[key])) {
                        change.removedItems = oldData[key];
                    }
                }

                if (field.isAssignee) {
                    this.eventEmitter.emit(
                        "notification.assignee",
                        new NotificationAssigneeEvent({
                            cardId: event.entity.id,
                            workspaceId: event.entity.workspace.id,
                            createdById: user?.id,
                            assigneeChange: {
                                oldValue: change.oldValue ?? [],
                                newValue: change.newValue ?? [],
                                type: "updated",
                            },
                        })
                    );
                }

                return change;
            })
        );

        return changes.filter(
            (change): change is FieldChange => change !== null
        );
    }

    private canMergeChanges({
        recentActivity,
        field,
        changes,
    }: {
        recentActivity: CardActivity;
        field: Field;
        changes: FieldChange[];
    }): boolean {
        return (
            field.multiple &&
            changes.every((newChange) =>
                (recentActivity.content as UpdateActivityContent).changes.some(
                    (existingChange) =>
                        existingChange.field?.id === newChange.field?.id &&
                        ((existingChange.addedItems && newChange.addedItems) ||
                            (existingChange.removedItems &&
                                newChange.removedItems))
                )
            )
        );
    }

    private mergeChanges(
        existingChanges: FieldChange[],
        newChanges: FieldChange[]
    ): FieldChange[] {
        const mergedChanges = [...existingChanges];

        newChanges.forEach((newChange) => {
            const existingChangeIndex = mergedChanges.findIndex(
                (ec) =>
                    ec.field.id === newChange.field.id &&
                    ec.type === newChange.type
            );

            if (existingChangeIndex !== -1) {
                const existingChange = mergedChanges[existingChangeIndex];

                if (
                    newChange.type === "updated" &&
                    Array.isArray(existingChange.newValue)
                ) {
                    const updatedAddedItems = [
                        ...(existingChange.addedItems || []),
                        ...(newChange.addedItems || []),
                    ].filter((v, i, a) => a.indexOf(v) === i);

                    const updatedRemovedItems = [
                        ...(existingChange.removedItems || []),
                        ...(newChange.removedItems || []),
                    ].filter((v, i, a) => a.indexOf(v) === i);

                    mergedChanges[existingChangeIndex] = {
                        ...existingChange,
                        newValue: newChange.newValue,
                        addedItems: updatedAddedItems.length
                            ? updatedAddedItems
                            : undefined,
                        removedItems: updatedRemovedItems.length
                            ? updatedRemovedItems
                            : undefined,
                    };
                } else {
                    mergedChanges[existingChangeIndex] = newChange;
                }
            } else {
                mergedChanges.push(newChange);
            }
        });

        return mergedChanges;
    }

    private async getFieldFromChangeKey(
        key: string,
        event: UpdateEvent<Card> | InsertEvent<Card>
    ) {
        const fieldRepo = event.manager.getRepository(Field);
        let field: Field | null = await fieldRepo.findOne({
            where: {
                slug: key,
                workspace: {
                    id: event.entity.workspace?.id
                        ? event.entity.workspace.id
                        : event.entity.workspace,
                },
                cardType: {
                    id: event.entity.type.id,
                },
            },
        });

        if (!field) {
            field = await fieldRepo.findOne({
                where: {
                    slug: key,
                    workspace: {
                        id: event.entity.workspace?.id
                            ? event.entity.workspace.id
                            : event.entity.workspace,
                    },
                    cardType: {
                        id: IsNull(),
                    },
                },
            });
        }

        return field;
    }

    private async handleActivityCreation(
        event: UpdateEvent<Card>,
        changes: FieldChange[]
    ) {
        const activityRepo = event.manager.getRepository(CardActivity);
        const user = this.clsService.get("user");
        const isAutomation = this.clsService.get("isAutomation");

        const recentActivity = await this.findRecentActivity(
            event,
            activityRepo,
            isAutomation,
            user
        );
        const field = await this.getFieldFromChangeKey(
            changes[0].field.slug,
            event
        );

        let activityToUse: CardActivity;
        const canMergeChanges =
            recentActivity &&
            this.canMergeChanges({
                recentActivity,
                field,
                changes,
            });

        if (canMergeChanges) {
            activityToUse = recentActivity;
            const mergedChanges = this.mergeChanges(
                (recentActivity.content as UpdateActivityContent).changes,
                changes
            );
            activityToUse.content = { changes: mergedChanges };
        } else {
            activityToUse = activityRepo.create({
                type: ActivityType.UPDATE,
                card: event.entity,
                content: { changes },
                createdByType: isAutomation ? "automation" : "user",
                createdBy: isAutomation ? undefined : { id: user.id },
            });
        }

        await activityRepo.save(activityToUse);
    }

    private async findRecentActivity(
        event: UpdateEvent<Card>,
        activityRepo: any,
        isAutomation: boolean,
        user: any
    ): Promise<CardActivity | null> {
        return activityRepo.findOne({
            where: {
                card: { id: event.entity.id },
                type: ActivityType.UPDATE,
                createdAt: MoreThanOrEqual(
                    new Date(Date.now() - CONFIG.ACTIVITY_GROUPING_WINDOW)
                ),
                content: Raw(
                    (alias) =>
                        `${alias} @> '{"changes": [{"type": "updated"}]}'`
                ),
                createdByType: isAutomation ? "automation" : "user",
                createdBy: isAutomation ? undefined : { id: user?.id },
            },
            order: { createdAt: "DESC" },
        });
    }
}
