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
    TriggerType,
    UpdateActivityContent,
} from "@tillywork/shared";
import { CardActivity } from "./card-activities/card.activity.entity";
import { Field } from "../fields/field.entity";
import { TriggerEvent } from "../automations/events/trigger.event";
import { EventEmitter2 } from "@nestjs/event-emitter";

const ACTIVITY_GROUPING_WINDOW = 1000 * 60 * 1; // 1 minute in milliseconds

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

        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: {
                id: event.entity.id,
            },
            content: {
                changes: [
                    {
                        type: "created",
                        newValue: event.entity,
                    },
                ],
            },
            createdByType: event.entity.createdByType,
            createdBy: event.entity.createdBy,
            createdAt: event.entity.createdAt,
        });

        await activityRepo.save(activity);

        const changes = await this.getFieldChanges(
            {},
            event.entity.data,
            event
        );

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        await Promise.all(
            changes.map((change) => {
                const activity = activityRepo.create({
                    type: ActivityType.UPDATE,
                    card: event.entity,
                    content: {
                        changes: [change],
                    },
                    createdByType: event.entity.createdByType,
                    createdBy: event.entity.createdBy,
                });

                return activityRepo.save(activity);
            })
        );
    }

    async afterUpdate(event: UpdateEvent<Card>) {
        const user = this.clsService.get("user");
        const isAutomation = this.clsService.get("isAutomation");

        if (
            !event.updatedColumns.some(
                (column) => column.propertyName === "data"
            )
        ) {
            return;
        }

        const activityRepo = event.manager.getRepository(CardActivity);

        const oldData = event.databaseEntity?.data || {};
        const newData = event.entity?.data || {};

        const changes = await this.getFieldChanges(oldData, newData, event);

        // Trigger automation events for each field change
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

        if (changes.length) {
            const recentActivity = await activityRepo.findOne({
                where: {
                    card: { id: event.entity.id },
                    type: ActivityType.UPDATE,
                    createdAt: MoreThanOrEqual(
                        new Date(Date.now() - ACTIVITY_GROUPING_WINDOW)
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

            const field = await this.getFieldFromChangeKey(
                changes[0].field.slug,
                event
            );

            let activityToUse: CardActivity;
            let canMergeChanges = false;

            if (recentActivity) {
                canMergeChanges = this.canMergeChanges({
                    recentActivity,
                    field,
                    changes,
                });
            }

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
                    content: {
                        changes,
                    },
                    createdByType: isAutomation ? "automation" : "user",
                    createdBy: isAutomation
                        ? undefined
                        : {
                              id: user.id,
                          },
                });
            }

            await activityRepo.save(activityToUse);
        }
    }

    private async getFieldChanges(
        oldData: Record<string, any>,
        newData: Record<string, any>,
        event: UpdateEvent<Card> | InsertEvent<Card>
    ): Promise<FieldChange[]> {
        const diffResult = diff(oldData, newData);

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
}
