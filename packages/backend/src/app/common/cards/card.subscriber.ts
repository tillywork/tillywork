import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    Connection,
    UpdateEvent,
    MoreThanOrEqual,
    IsNull,
} from "typeorm";
import { Card } from "./card.entity";
import { Injectable, Logger } from "@nestjs/common";
import { CardActivity } from "./card-activities/card.activity.entity";
import { diff } from "deep-object-diff";
import { ClsService } from "nestjs-cls";
import { Field } from "../fields/field.entity";
import {
    ACTIVITY_FIELD_TYPES,
    ActivityType,
    FieldChange,
    UpdateActivityContent,
} from "@tillywork/shared";

const ACTIVITY_GROUPING_WINDOW = 1000 * 60 * 1; // 1 minute in milliseconds

@Injectable()
@EventSubscriber()
export class CardSubscriber implements EntitySubscriberInterface<Card> {
    private readonly logger = new Logger("CardSubscriber");

    constructor(connection: Connection, private clsService: ClsService) {
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
            card: event.entity,
            content: {
                changes: [
                    {
                        type: "created",
                        newValue: event.entity,
                    },
                ],
            },
            createdBy: event.entity.createdBy,
        });
        activityRepo.save(activity);
    }

    async afterUpdate(event: UpdateEvent<Card>) {
        const user = this.clsService.get("user");

        if (
            !event.updatedColumns.some(
                (column) => column.propertyName === "data"
            )
        ) {
            return;
        }

        const activityRepo = event.manager.getRepository(CardActivity);

        const oldData = event.databaseEntity.data || {};
        const newData = event.entity.data || {};

        const changes = await this.getFieldChanges(oldData, newData, event);

        if (changes.length) {
            const recentActivity = await activityRepo.findOne({
                where: {
                    card: { id: event.entity.id },
                    type: ActivityType.UPDATE,
                    createdAt: MoreThanOrEqual(
                        new Date(Date.now() - ACTIVITY_GROUPING_WINDOW)
                    ),
                    createdBy: { id: user.id },
                },
                order: { createdAt: "DESC" },
            });

            let activityToUse: CardActivity;
            let canGroupChanges = false;

            if (recentActivity) {
                canGroupChanges = changes.every((newChange) =>
                    (
                        recentActivity.content as UpdateActivityContent
                    ).changes.some(
                        (existingChange) =>
                            existingChange.field?.id === newChange.field?.id &&
                            ((existingChange.addedItems &&
                                newChange.addedItems) ||
                                (existingChange.removedItems &&
                                    newChange.removedItems))
                    )
                );
            }

            if (canGroupChanges) {
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
                    createdBy: {
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
        event: UpdateEvent<Card>
    ): Promise<FieldChange[]> {
        const fieldRepo = event.manager.getRepository(Field);

        const diffResult = diff(oldData, newData);

        const changes = await Promise.all(
            Object.keys(diffResult).map(async (key) => {
                let field: Field | null = await fieldRepo.findOne({
                    where: {
                        slug: key,
                        workspace: {
                            id: event.entity.workspace.id,
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
                                id: event.entity.workspace.id,
                            },
                            cardType: {
                                id: IsNull(),
                            },
                        },
                    });
                }

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
                };

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

                return change;
            })
        );

        return changes.filter(
            (change): change is FieldChange => change !== null
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
}
