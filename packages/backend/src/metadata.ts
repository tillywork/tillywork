/* eslint-disable */
export default async () => {
    const t = {
        ["./app/common/cards/card.entity"]: await import(
            "./app/common/cards/card.entity"
        ),
        ["../../shared/src/lib/cards/index"]: await import(
            "../../shared/src/lib/cards/index"
        ),
        ["./app/common/users/user.entity"]: await import(
            "./app/common/users/user.entity"
        ),
        ["./app/common/projects/project.entity"]: await import(
            "./app/common/projects/project.entity"
        ),
        ["./app/common/projects/project-users/project.user.entity"]:
            await import(
                "./app/common/projects/project-users/project.user.entity"
            ),
        ["./app/common/workspaces/workspace.entity"]: await import(
            "./app/common/workspaces/workspace.entity"
        ),
        ["../../shared/src/lib/fields/index"]: await import(
            "../../shared/src/lib/fields/index"
        ),
        ["./app/common/card-types/card.type.entity"]: await import(
            "./app/common/card-types/card.type.entity"
        ),
        ["./app/common/lists/list.entity"]: await import(
            "./app/common/lists/list.entity"
        ),
        ["./app/common/fields/field.entity"]: await import(
            "./app/common/fields/field.entity"
        ),
        ["../../shared/src/lib/card-types/index"]: await import(
            "../../shared/src/lib/card-types/index"
        ),
        ["./app/common/workspaces/types"]: await import(
            "./app/common/workspaces/types"
        ),
        ["../../shared/src/lib/auth/index"]: await import(
            "../../shared/src/lib/auth/index"
        ),
        ["./app/common/spaces/space.entity"]: await import(
            "./app/common/spaces/space.entity"
        ),
        ["./app/common/cards/card-lists/card.list.entity"]: await import(
            "./app/common/cards/card-lists/card.list.entity"
        ),
        ["./app/common/views/types"]: await import("./app/common/views/types"),
        ["../../shared/src/lib/lists/list.groups"]: await import(
            "../../shared/src/lib/lists/list.groups"
        ),
        ["./app/common/lists/types"]: await import("./app/common/lists/types"),
        ["../../shared/src/lib/lists/lists"]: await import(
            "../../shared/src/lib/lists/lists"
        ),
        ["./app/common/lists/list-stages/list.stage.entity"]: await import(
            "./app/common/lists/list-stages/list.stage.entity"
        ),
        ["./app/common/lists/list-groups/list.group.entity"]: await import(
            "./app/common/lists/list-groups/list.group.entity"
        ),
        ["./app/common/views/view.entity"]: await import(
            "./app/common/views/view.entity"
        ),
        ["./app/common/cards/card-activities/card.activity.entity"]:
            await import(
                "./app/common/cards/card-activities/card.activity.entity"
            ),
        ["./app/common/projects/project-users/dto/create.project.user.dto"]:
            await import(
                "./app/common/projects/project-users/dto/create.project.user.dto"
            ),
        ["../../shared/src/lib/notifications/index"]: await import(
            "../../shared/src/lib/notifications/index"
        ),
        ["../../shared/src/lib/automations/step"]: await import(
            "../../shared/src/lib/automations/step"
        ),
        ["./app/common/automations/entities/automation.entity"]: await import(
            "./app/common/automations/entities/automation.entity"
        ),
        ["./app/common/automations/entities/automation.step.entity"]:
            await import(
                "./app/common/automations/entities/automation.step.entity"
            ),
        ["../../shared/src/lib/automations/index"]: await import(
            "../../shared/src/lib/automations/index"
        ),
        ["./app/common/automations/entities/automation.location.entity"]:
            await import(
                "./app/common/automations/entities/automation.location.entity"
            ),
        ["./app/common/automations/dto/create.automation.step.dto"]:
            await import(
                "./app/common/automations/dto/create.automation.step.dto"
            ),
        ["./app/common/automations/dto/create.automation.location.dto"]:
            await import(
                "./app/common/automations/dto/create.automation.location.dto"
            ),
        ["./app/common/automations/entities/automation.run.entity"]:
            await import(
                "./app/common/automations/entities/automation.run.entity"
            ),
        ["./app/common/automations/entities/automation.step.run.entity"]:
            await import(
                "./app/common/automations/entities/automation.step.run.entity"
            ),
        ["../../shared/src/lib/views/views"]: await import(
            "../../shared/src/lib/views/views"
        ),
        ["./app/common/filters/types"]: await import(
            "./app/common/filters/types"
        ),
        ["./app/common/mailer/types"]: await import(
            "./app/common/mailer/types"
        ),
        ["./app/common/files/types"]: await import("./app/common/files/types"),
        ["../../shared/src/lib/integrations/index"]: await import(
            "../../shared/src/lib/integrations/index"
        ),
        ["./app/common/notifications/notification-preference/notification.preference.entity"]:
            await import(
                "./app/common/notifications/notification-preference/notification.preference.entity"
            ),
        ["./app/common/filters/filter.entity"]: await import(
            "./app/common/filters/filter.entity"
        ),
        ["./app/common/files/file.entity"]: await import(
            "./app/common/files/file.entity"
        ),
        ["./app/common/notifications/notification.entity"]: await import(
            "./app/common/notifications/notification.entity"
        ),
        ["./app/common/watchers/watcher.entity"]: await import(
            "./app/common/watchers/watcher.entity"
        ),
        ["./app/common/user-integrations/user.integration.entity"]:
            await import(
                "./app/common/user-integrations/user.integration.entity"
            ),
    };
    return {
        "@nestjs/swagger": {
            models: [
                [
                    import(
                        "./app/common/cards/card-activities/card.activity.entity"
                    ),
                    {
                        CardActivity: {
                            id: { required: true, type: () => Number },
                            card: {
                                required: true,
                                type: () =>
                                    t["./app/common/cards/card.entity"].Card,
                            },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/cards/index"]
                                    .ActivityType,
                            },
                            content: { required: true, type: () => Object },
                            createdByType: {
                                required: true,
                                type: () => Object,
                            },
                            createdBy: {
                                required: false,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/projects/project-users/project.user.entity"
                    ),
                    {
                        ProjectUser: {
                            id: { required: true, type: () => Number },
                            project: {
                                required: true,
                                type: () =>
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                            },
                            user: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            role: { required: true, type: () => String },
                            createdAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/projects/project.entity"),
                    {
                        Project: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            ownerId: { required: true, type: () => Number },
                            inviteCode: { required: true, type: () => String },
                            userUploadLimit: {
                                required: true,
                                type: () => Number,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            users: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/projects/project-users/project.user.entity"
                                    ].ProjectUser,
                                ],
                            },
                            workspaces: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                                ],
                            },
                        },
                    },
                ],
                [
                    import("./app/common/fields/field.entity"),
                    {
                        Field: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            slug: { required: true, type: () => String },
                            isTitle: {
                                required: true,
                                type: () => Boolean,
                                description:
                                    "Defines whether this field is the main title field of the entity.",
                            },
                            isDescription: {
                                required: true,
                                type: () => Boolean,
                                description:
                                    "Defines whether this field is the main description field of the entity.",
                            },
                            isPhoto: {
                                required: true,
                                type: () => Boolean,
                                description:
                                    "Defines whether this field is the main photo field of the entity.",
                            },
                            isAssignee: {
                                required: true,
                                type: () => Boolean,
                                description:
                                    "Defines whether this field is the main assignee field of the entity.",
                            },
                            isPinned: {
                                required: true,
                                type: () => Boolean,
                                description:
                                    "Pinned fields appear in the views and the create card dialog.",
                            },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/fields/index"]
                                    .FieldTypes,
                            },
                            icon: { required: true, type: () => String },
                            required: { required: true, type: () => Boolean },
                            multiple: { required: true, type: () => Boolean },
                            items: {
                                required: false,
                                type: () => [Object],
                                description:
                                    "Contains the items for dropdown fields.",
                            },
                            cardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                                description:
                                    "Defines whether this is an entity-specific field.",
                            },
                            dataCardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                                description:
                                    "Defines the card type that shows as the field items.",
                            },
                            createdByType: {
                                required: true,
                                type: () => Object,
                            },
                            createdBy: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            lists: {
                                required: true,
                                type: () => [
                                    t["./app/common/lists/list.entity"].List,
                                ],
                            },
                        },
                    },
                ],
                [
                    import("./app/common/card-types/card.type.entity"),
                    {
                        CardType: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            fields: {
                                required: true,
                                type: () => [
                                    t["./app/common/fields/field.entity"].Field,
                                ],
                            },
                            titleTemplate: {
                                required: true,
                                type: () => String,
                                description:
                                    'Template string for generating card titles.\nUses mustache-style syntax: {{fieldSlug}}\nExample: "{{firstName}} {{lastName}}" for contacts\nIf not set, falls back to the field marked as isTitle',
                            },
                            hasChildren: {
                                required: true,
                                type: () => Boolean,
                            },
                            layout: {
                                required: true,
                                enum: t["../../shared/src/lib/card-types/index"]
                                    .CardTypeLayout,
                            },
                            createdByType: {
                                required: true,
                                type: () => Object,
                            },
                            createdBy: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/workspaces/workspace.entity"),
                    {
                        Workspace: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            ownerId: { required: true, type: () => Number },
                            type: {
                                required: true,
                                enum: t["./app/common/workspaces/types"]
                                    .WorkspaceTypes,
                            },
                            accessType: {
                                required: true,
                                enum: t["../../shared/src/lib/auth/index"]
                                    .AccessType,
                            },
                            currency: { required: true, type: () => String },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                            project: {
                                required: true,
                                type: () => [
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                                ],
                            },
                            projectId: { required: true, type: () => Number },
                            spaces: {
                                required: true,
                                type: () => [
                                    t["./app/common/spaces/space.entity"].Space,
                                ],
                            },
                            users: {
                                required: true,
                                type: () => [
                                    t["./app/common/users/user.entity"].User,
                                ],
                            },
                            cardTypes: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                                ],
                            },
                            defaultCardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/spaces/space.entity"),
                    {
                        Space: {
                            id: { required: true, type: () => Number },
                            icon: { required: true, type: () => String },
                            iconColor: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            accessType: {
                                required: true,
                                enum: t["../../shared/src/lib/auth/index"]
                                    .AccessType,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            workspaceId: { required: true, type: () => Number },
                            lists: {
                                required: true,
                                type: () => [
                                    t["./app/common/lists/list.entity"].List,
                                ],
                            },
                        },
                    },
                ],
                [
                    import("./app/common/lists/list-stages/list.stage.entity"),
                    {
                        ListStage: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            color: { required: true, type: () => String },
                            order: { required: true, type: () => Number },
                            isCompleted: {
                                required: true,
                                type: () => Boolean,
                                description:
                                    "When set to true, sets card\nas closed when it is moved to it.",
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            list: {
                                required: true,
                                type: () =>
                                    t["./app/common/lists/list.entity"].List,
                            },
                            listId: { required: true, type: () => Number },
                            cardLists: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/cards/card-lists/card.list.entity"
                                    ].CardList,
                                ],
                            },
                        },
                    },
                ],
                [
                    import("./app/common/views/view.entity"),
                    {
                        View: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            type: {
                                required: true,
                                enum: t["./app/common/views/types"].ViewTypes,
                            },
                            options: { required: true, type: () => Object },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            list: {
                                required: true,
                                type: () =>
                                    t["./app/common/lists/list.entity"].List,
                            },
                            listId: { required: true, type: () => Number },
                            filters: { required: false, type: () => Object },
                        },
                    },
                ],
                [
                    import("./app/common/lists/list-groups/list.group.entity"),
                    {
                        ListGroup: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            type: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/lists/list.groups"
                                ].ListGroupOptions,
                            },
                            entityId: { required: true, type: () => Number },
                            entityType: {
                                required: true,
                                enum: t["./app/common/lists/types"]
                                    .ListGroupEntityTypes,
                            },
                            isExpanded: {
                                required: true,
                                type: () => Boolean,
                                description: "TODO move this to view level",
                            },
                            color: { required: true, type: () => String },
                            order: { required: true, type: () => Number },
                            icon: { required: true, type: () => String },
                            filter: { required: false, type: () => Object },
                            field: {
                                required: true,
                                type: () =>
                                    t["./app/common/fields/field.entity"].Field,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            list: {
                                required: true,
                                type: () =>
                                    t["./app/common/lists/list.entity"].List,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/lists/list.entity"),
                    {
                        List: {
                            id: { required: true, type: () => Number },
                            icon: { required: true, type: () => String },
                            iconColor: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            accessType: {
                                required: true,
                                enum: t["../../shared/src/lib/auth/index"]
                                    .AccessType,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: false, type: () => Date },
                            space: {
                                required: true,
                                type: () =>
                                    t["./app/common/spaces/space.entity"].Space,
                            },
                            spaceId: { required: true, type: () => Number },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            workspaceId: { required: true, type: () => Number },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/lists/lists"]
                                    .ListType,
                            },
                            slug: { required: true, type: () => String },
                            listStages: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/lists/list-stages/list.stage.entity"
                                    ].ListStage,
                                ],
                            },
                            listGroups: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/lists/list-groups/list.group.entity"
                                    ].ListGroup,
                                ],
                            },
                            cardLists: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/cards/card-lists/card.list.entity"
                                    ].CardList,
                                ],
                            },
                            views: {
                                required: true,
                                type: () => [
                                    t["./app/common/views/view.entity"].View,
                                ],
                            },
                            defaultCardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                            },
                            fields: {
                                required: true,
                                type: () => [
                                    t["./app/common/fields/field.entity"].Field,
                                ],
                            },
                        },
                    },
                ],
                [
                    import("./app/common/cards/card-lists/card.list.entity"),
                    {
                        CardList: {
                            id: { required: true, type: () => Number },
                            listStage: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/lists/list-stages/list.stage.entity"
                                    ].ListStage,
                            },
                            listStageId: { required: true, type: () => Number },
                            card: {
                                required: true,
                                type: () =>
                                    t["./app/common/cards/card.entity"].Card,
                            },
                            list: {
                                required: true,
                                type: () =>
                                    t["./app/common/lists/list.entity"].List,
                            },
                            listId: { required: true, type: () => Number },
                            order: { required: true, type: () => Number },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/cards/card.entity"),
                    {
                        Card: {
                            id: { required: true, type: () => Number },
                            type: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                            },
                            data: { required: true, type: () => Object },
                            createdByType: {
                                required: true,
                                type: () => Object,
                            },
                            cardLists: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/cards/card-lists/card.list.entity"
                                    ].CardList,
                                ],
                            },
                            users: {
                                required: true,
                                type: () => [
                                    t["./app/common/users/user.entity"].User,
                                ],
                            },
                            activities: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/cards/card-activities/card.activity.entity"
                                    ].CardActivity,
                                ],
                            },
                            createdBy: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                            parent: {
                                required: false,
                                type: () =>
                                    t["./app/common/cards/card.entity"].Card,
                            },
                            children: {
                                required: true,
                                type: () => [
                                    t["./app/common/cards/card.entity"].Card,
                                ],
                            },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            workspaceId: { required: true, type: () => Number },
                        },
                    },
                ],
                [
                    import("./app/common/users/user.entity"),
                    {
                        User: {
                            id: {
                                required: true,
                                type: () => Number,
                                description:
                                    "The unique identifier for the user.",
                            },
                            email: {
                                required: true,
                                type: () => String,
                                description:
                                    "The user's email address. It can also be set to unique if you desire.",
                            },
                            password: {
                                required: true,
                                type: () => String,
                                description:
                                    "The hashed password for the user. It is stored in a secure way using bcrypt.",
                            },
                            firstName: {
                                required: true,
                                type: () => String,
                                description: "The first name of the user.",
                            },
                            lastName: {
                                required: true,
                                type: () => String,
                                description: "The last name of the user.",
                            },
                            phoneNumber: {
                                required: true,
                                type: () => String,
                                description: "The user's phone number.",
                            },
                            country: {
                                required: true,
                                type: () => String,
                                description: "The user's country (ISO2 code)",
                            },
                            photo: {
                                required: true,
                                type: () => String,
                                description: "The photo URL of the user.",
                            },
                            roles: {
                                required: true,
                                type: () => [String],
                                description:
                                    "The roles assigned to the user. It can represent different permission levels.",
                            },
                            onboarding: {
                                required: true,
                                type: () => Object,
                                description:
                                    "Holds general data from the user's onboarding",
                            },
                            createdAt: {
                                required: true,
                                type: () => Date,
                                description:
                                    "A timestamp representing when the user account was created.",
                            },
                            updatedAt: {
                                required: true,
                                type: () => Date,
                                description:
                                    "A timestamp representing when the user account was last updated.",
                            },
                            deletedAt: { required: true, type: () => Date },
                            projects: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/projects/project-users/project.user.entity"
                                    ].ProjectUser,
                                ],
                                description:
                                    "A relationship to the ProjectUser entity representing the user's projects.",
                            },
                            cards: {
                                required: true,
                                type: () => [
                                    t["./app/common/cards/card.entity"].Card,
                                ],
                                description:
                                    "A relationship to the Card entity representing the user's cards.",
                            },
                            project: {
                                required: true,
                                type: () =>
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                                description:
                                    "The user's current active project.",
                            },
                        },
                    },
                ],
                [
                    import("./app/common/users/dto/create.user.dto"),
                    {
                        CreateUserDto: {
                            firstName: { required: true, type: () => String },
                            lastName: { required: true, type: () => String },
                            email: { required: true, type: () => String },
                            password: { required: true, type: () => String },
                            phoneNumber: {
                                required: false,
                                type: () => String,
                            },
                            country: { required: false, type: () => String },
                            inviteCode: { required: false, type: () => String },
                        },
                    },
                ],
                [
                    import("./app/common/users/dto/update.user.dto"),
                    { UpdateUserDto: {} },
                ],
                [
                    import(
                        "./app/common/projects/project-users/dto/create.project.user.dto"
                    ),
                    {
                        CreateProjectUserDto: {
                            user: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            role: { required: true, type: () => String },
                            project: {
                                required: true,
                                type: () =>
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/projects/dto/create.project.dto"),
                    {
                        CreateProjectDto: {
                            name: { required: true, type: () => String },
                            ownerId: { required: false, type: () => Number },
                            users: {
                                required: false,
                                type: () => [
                                    t[
                                        "./app/common/projects/project-users/dto/create.project.user.dto"
                                    ].CreateProjectUserDto,
                                ],
                            },
                        },
                    },
                ],
                [
                    import("./app/common/projects/dto/update.project.dto"),
                    { UpdateProjectDto: {} },
                ],
                [
                    import(
                        "./app/common/projects/project-users/dto/update.project.user.dto"
                    ),
                    { UpdateProjectUserDto: {} },
                ],
                [
                    import("./app/common/auth/entities/access.control.entity"),
                    {
                        AccessControl: {
                            id: { required: true, type: () => Number },
                            user: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            permissionLevel: {
                                required: true,
                                enum: t["../../shared/src/lib/auth/index"]
                                    .PermissionLevel,
                            },
                            project: {
                                required: false,
                                type: () =>
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                            },
                            workspace: {
                                required: false,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            space: {
                                required: false,
                                type: () =>
                                    t["./app/common/spaces/space.entity"].Space,
                            },
                            list: {
                                required: false,
                                type: () =>
                                    t["./app/common/lists/list.entity"].List,
                            },
                            createdAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/notifications/notification-preference/notification.preference.entity"
                    ),
                    {
                        NotificationPreference: {
                            id: { required: true, type: () => String },
                            user: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            channel: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/notifications/index"
                                ].NotificationChannel,
                            },
                            enabled: { required: true, type: () => Boolean },
                            config: { required: true, type: () => Object },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/notifications/notification-preference/dto/upsert.notification.preference.dto"
                    ),
                    {
                        UpsertNotificationPreferenceDto: {
                            channel: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/notifications/index"
                                ].NotificationChannel,
                            },
                            enabled: { required: false, type: () => Boolean },
                            config: { required: false, type: () => Object },
                        },
                    },
                ],
                [
                    import("./app/common/cards/dto/create.card.dto"),
                    {
                        CreateCardDto: {
                            data: { required: true, type: () => Object },
                            listId: { required: true, type: () => Number },
                            listStageId: {
                                required: false,
                                type: () => Number,
                            },
                            listStage: {
                                required: false,
                                type: () =>
                                    t[
                                        "./app/common/lists/list-stages/list.stage.entity"
                                    ].ListStage,
                            },
                            type: { required: true, type: () => Number },
                            workspaceId: { required: true, type: () => Number },
                            createdBy: { required: false, type: () => Number },
                            createdByType: {
                                required: false,
                                type: () => Object,
                            },
                            parentId: { required: false, type: () => Number },
                        },
                    },
                ],
                [
                    import("./app/common/cards/dto/update.card.dto"),
                    { UpdateCardDto: {} },
                ],
                [
                    import(
                        "./app/common/cards/card-lists/dto/create.card.list.dto"
                    ),
                    {
                        CreateCardListDto: {
                            cardId: { required: true, type: () => Number },
                            listId: { required: true, type: () => Number },
                            listStageId: { required: true, type: () => Number },
                            order: { required: false, type: () => Number },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/cards/card-lists/dto/update.card.list.dto"
                    ),
                    { UpdateCardListDto: {} },
                ],
                [
                    import(
                        "./app/common/cards/card-activities/dto/create.card.activity.dto"
                    ),
                    {
                        CreateCardActivityDto: {
                            card: { required: true, type: () => Number },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/cards/index"]
                                    .ActivityType,
                            },
                            content: { required: true, type: () => Object },
                            createdBy: {
                                required: false,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdByType: {
                                required: false,
                                type: () => Object,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/cards/card-activities/dto/update.card.activity.dto"
                    ),
                    { UpdateCardActivityDto: {} },
                ],
                [
                    import(
                        "./app/common/automations/entities/automation.step.entity"
                    ),
                    {
                        AutomationStep: {
                            id: { required: true, type: () => String },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/automations/step"]
                                    .AutomationStepType,
                            },
                            value: { required: false, type: () => Object },
                            data: { required: true, type: () => Object },
                            automation: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.entity"
                                    ].Automation,
                            },
                            nextStep: {
                                required: false,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.step.entity"
                                    ].AutomationStep,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/entities/automation.location.entity"
                    ),
                    {
                        AutomationLocation: {
                            id: { required: true, type: () => String },
                            locationId: { required: true, type: () => Number },
                            locationType: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/automations/index"
                                ].LocationType,
                            },
                            automation: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.entity"
                                    ].Automation,
                            },
                            space: {
                                required: true,
                                type: () =>
                                    t["./app/common/spaces/space.entity"].Space,
                            },
                            list: {
                                required: true,
                                type: () =>
                                    t["./app/common/lists/list.entity"].List,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/entities/automation.entity"
                    ),
                    {
                        Automation: {
                            id: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            isEnabled: { required: true, type: () => Boolean },
                            trigger: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.step.entity"
                                    ].AutomationStep,
                            },
                            steps: {
                                required: false,
                                type: () => [
                                    t[
                                        "./app/common/automations/entities/automation.step.entity"
                                    ].AutomationStep,
                                ],
                                description:
                                    "Virtual column to load steps through the linked list.",
                            },
                            locations: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/automations/entities/automation.location.entity"
                                    ].AutomationLocation,
                                ],
                            },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            createdByType: {
                                required: true,
                                type: () => Object,
                            },
                            createdBy: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/dto/create.automation.step.dto"
                    ),
                    {
                        CreateAutomationStepDto: {
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/automations/step"]
                                    .AutomationStepType,
                            },
                            value: { required: true, type: () => Object },
                            data: { required: true, type: () => Object },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/dto/create.automation.location.dto"
                    ),
                    {
                        CreateAutomationLocationDto: {
                            automationId: {
                                required: true,
                                type: () => String,
                            },
                            locationId: { required: true, type: () => Number },
                            locationType: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/automations/index"
                                ].LocationType,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/dto/create.automation.dto"
                    ),
                    {
                        CreateAutomationDto: {
                            name: { required: true, type: () => String },
                            steps: {
                                required: false,
                                type: () => [
                                    t[
                                        "./app/common/automations/dto/create.automation.step.dto"
                                    ].CreateAutomationStepDto,
                                ],
                            },
                            trigger: {
                                required: false,
                                type: () =>
                                    t[
                                        "./app/common/automations/dto/create.automation.step.dto"
                                    ].CreateAutomationStepDto,
                            },
                            locations: {
                                required: false,
                                type: () => [
                                    t[
                                        "./app/common/automations/dto/create.automation.location.dto"
                                    ].CreateAutomationLocationDto,
                                ],
                            },
                            workspaceId: { required: true, type: () => Number },
                            createdBy: {
                                required: false,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/dto/update.automation.dto"
                    ),
                    { UpdateAutomationDto: {} },
                ],
                [
                    import(
                        "./app/common/automations/entities/automation.step.run.entity"
                    ),
                    {
                        AutomationStepRun: {
                            id: { required: true, type: () => String },
                            run: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.run.entity"
                                    ].AutomationRun,
                            },
                            step: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.step.entity"
                                    ].AutomationStep,
                            },
                            order: { required: true, type: () => Number },
                            input: { required: true, type: () => Object },
                            output: { required: true, type: () => Object },
                            status: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/automations/index"
                                ].AutomationRunStatus,
                            },
                            error: { required: false, type: () => Object },
                            executedAt: { required: true, type: () => Date },
                            duration: { required: false, type: () => Number },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/entities/automation.run.entity"
                    ),
                    {
                        AutomationRun: {
                            id: { required: true, type: () => String },
                            automation: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/automations/entities/automation.entity"
                                    ].Automation,
                            },
                            status: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/automations/index"
                                ].AutomationRunStatus,
                            },
                            error: { required: false, type: () => Object },
                            startedAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            steps: {
                                required: true,
                                type: () => [
                                    t[
                                        "./app/common/automations/entities/automation.step.run.entity"
                                    ].AutomationStepRun,
                                ],
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/dto/create.automation.run.dto"
                    ),
                    {
                        CreateAutomationRunDto: {
                            automationId: {
                                required: true,
                                type: () => String,
                            },
                            status: {
                                required: false,
                                enum: t[
                                    "../../shared/src/lib/automations/index"
                                ].AutomationRunStatus,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/dto/update.automation.run.dto"
                    ),
                    { UpdateAutomationRunDto: {} },
                ],
                [
                    import("./app/common/lists/dto/create.list.dto"),
                    {
                        CreateListDto: {
                            icon: { required: false, type: () => String },
                            iconColor: { required: false, type: () => String },
                            name: { required: true, type: () => String },
                            spaceId: { required: false, type: () => Number },
                            workspaceId: {
                                required: false,
                                type: () => Number,
                            },
                            defaultCardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                            },
                            createDefaultStages: {
                                required: false,
                                type: () => Boolean,
                            },
                            defaultViewType: {
                                required: false,
                                enum: t["../../shared/src/lib/views/views"]
                                    .ViewTypes,
                            },
                            type: {
                                required: false,
                                enum: t["../../shared/src/lib/lists/lists"]
                                    .ListType,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/lists/dto/update.list.dto"),
                    { UpdateListDto: {} },
                ],
                [
                    import(
                        "./app/common/lists/list-stages/dto/create.list.stage.dto"
                    ),
                    {
                        CreateListStageDto: {
                            name: { required: true, type: () => String },
                            listId: { required: true, type: () => Number },
                            color: { required: true, type: () => String },
                            order: { required: true, type: () => Number },
                            isCompleted: {
                                required: false,
                                type: () => Boolean,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/lists/list-stages/dto/update.list.stage.dto"
                    ),
                    { UpdateListStageDto: {} },
                ],
                [
                    import("./app/common/views/dto/create.view.dto"),
                    {
                        CreateViewDto: {
                            name: { required: true, type: () => String },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/views/views"]
                                    .ViewTypes,
                            },
                            listId: { required: true, type: () => Number },
                            options: { required: false, type: () => Object },
                        },
                    },
                ],
                [
                    import("./app/common/views/dto/update.view.dto"),
                    { UpdateViewDto: {} },
                ],
                [
                    import("./app/common/fields/dto/create.field.dto"),
                    {
                        CreateFieldDto: {
                            name: { required: true, type: () => String },
                            slug: { required: true, type: () => String },
                            type: {
                                required: true,
                                enum: t["../../shared/src/lib/fields/index"]
                                    .FieldTypes,
                            },
                            cardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                            },
                            dataCardType: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                            },
                            icon: { required: true, type: () => String },
                            workspaceId: { required: true, type: () => Number },
                            required: {
                                required: false,
                                type: () => Boolean,
                                default: false,
                            },
                            multiple: {
                                required: false,
                                type: () => Boolean,
                                default: false,
                            },
                            items: { required: false, type: () => [Object] },
                            createdByType: {
                                required: false,
                                type: () => Object,
                            },
                            createdBy: {
                                required: false,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/fields/dto/update.field.dto"),
                    { UpdateFieldDto: {} },
                ],
                [
                    import(
                        "./app/common/lists/list-groups/dto/create.list.group.dto"
                    ),
                    {
                        CreateListGroupDto: {
                            name: { required: false, type: () => String },
                            filter: { required: false, type: () => Object },
                            type: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/lists/list.groups"
                                ].ListGroupOptions,
                            },
                            entityId: { required: false, type: () => Number },
                            entityType: {
                                required: false,
                                enum: t["./app/common/lists/types"]
                                    .ListGroupEntityTypes,
                            },
                            color: { required: false, type: () => String },
                            icon: { required: false, type: () => String },
                            order: { required: false, type: () => Number },
                            isExpanded: {
                                required: false,
                                type: () => Boolean,
                            },
                            fieldId: { required: false, type: () => Number },
                            listId: { required: false, type: () => Number },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/lists/list-groups/dto/update.list.group.dto"
                    ),
                    { UpdateListGroupDto: {} },
                ],
                [
                    import("./app/common/filters/filter.entity"),
                    {
                        Filter: {
                            id: { required: true, type: () => Number },
                            name: { required: true, type: () => String },
                            where: { required: true, type: () => Object },
                            entityId: { required: true, type: () => Number },
                            entityType: {
                                required: true,
                                enum: t["./app/common/filters/types"]
                                    .FilterEntityTypes,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/spaces/dto/create.space.dto"),
                    {
                        CreateSpaceDto: {
                            icon: { required: false, type: () => String },
                            iconColor: { required: false, type: () => String },
                            name: { required: true, type: () => String },
                            workspaceId: { required: true, type: () => Number },
                            createOnboardingData: {
                                required: false,
                                type: () => Boolean,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/spaces/dto/update.space.dto"),
                    { UpdateSpaceDto: {} },
                ],
                [
                    import("./app/common/workspaces/dto/create.workspace.dto"),
                    {
                        CreateWorkspaceDto: {
                            name: { required: true, type: () => String },
                            ownerId: { required: false, type: () => Number },
                            type: {
                                required: true,
                                enum: t["./app/common/workspaces/types"]
                                    .WorkspaceTypes,
                            },
                            accessType: {
                                required: true,
                                enum: t["../../shared/src/lib/auth/index"]
                                    .AccessType,
                            },
                            projectId: { required: true, type: () => Number },
                        },
                    },
                ],
                [
                    import("./app/common/workspaces/dto/update.workspace.dto"),
                    { UpdateWorkspaceDto: {} },
                ],
                [
                    import("./app/common/card-types/dto/create.card.type.dto"),
                    {
                        CreateCardTypeDto: {
                            name: { required: true, type: () => String },
                            workspaceId: { required: true, type: () => Number },
                            layout: {
                                required: false,
                                enum: t["../../shared/src/lib/card-types/index"]
                                    .CardTypeLayout,
                            },
                            hasChildren: {
                                required: false,
                                type: () => Boolean,
                            },
                            titleTemplate: {
                                required: false,
                                type: () => String,
                            },
                            workspace: {
                                required: false,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            createdBy: {
                                required: false,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            createdByType: {
                                required: false,
                                type: () => Object,
                            },
                            fields: { required: false, type: () => [Object] },
                        },
                    },
                ],
                [
                    import("./app/common/card-types/dto/update.card.type.dto"),
                    { UpdateCardTypeDto: {} },
                ],
                [
                    import("./app/common/filters/dto/create.filter.dto"),
                    {
                        CreateFilterDto: {
                            name: { required: false, type: () => String },
                            entityId: { required: false, type: () => Number },
                            entityType: {
                                required: false,
                                enum: t["./app/common/filters/types"]
                                    .FilterEntityTypes,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/filters/dto/update.filter.dto"),
                    { UpdateFilterDto: {} },
                ],
                [
                    import("./app/common/mailer/email.entity"),
                    {
                        Email: {
                            id: { required: true, type: () => String },
                            to: { required: true, type: () => String },
                            subject: { required: true, type: () => String },
                            body: { required: true, type: () => String },
                            status: {
                                required: true,
                                enum: t["./app/common/mailer/types"]
                                    .EmailStatus,
                            },
                            openTimes: { required: true, type: () => [String] },
                            openCount: { required: true, type: () => Number },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/files/file.entity"),
                    {
                        TWFile: {
                            id: { required: true, type: () => String },
                            name: {
                                required: true,
                                type: () => String,
                                description:
                                    "The original file name, used for display on the frontend.",
                            },
                            key: {
                                required: true,
                                type: () => String,
                                description:
                                    "The file name prepended with upload time timestamp.",
                            },
                            url: {
                                required: true,
                                type: () => String,
                                description: "The full URL of the file.",
                            },
                            type: {
                                required: true,
                                description:
                                    "Used to render image and other files differently.",
                                enum: t["./app/common/files/types"].TWFileType,
                            },
                            size: {
                                required: true,
                                type: () => Number,
                                description: "Holds file size in bytes.",
                            },
                            createdBy: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            project: {
                                required: true,
                                type: () =>
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                            deletedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/files/dtos/create.file.dto"),
                    {
                        CreateFileDto: {
                            name: { required: true, type: () => String },
                            key: { required: true, type: () => String },
                            url: { required: false, type: () => String },
                            type: {
                                required: true,
                                enum: t["./app/common/files/types"].TWFileType,
                            },
                            size: { required: true, type: () => Number },
                            createdBy: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            projectId: { required: true, type: () => Number },
                        },
                    },
                ],
                [
                    import("./app/common/files/dtos/update.file.dto"),
                    { UpdateFileDto: {} },
                ],
                [
                    import("./app/common/notifications/notification.entity"),
                    {
                        Notification: {
                            id: { required: true, type: () => String },
                            type: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/notifications/index"
                                ].NotificationType,
                            },
                            relatedResourceId: {
                                required: false,
                                type: () => String,
                            },
                            relatedResourceType: {
                                required: false,
                                type: () => String,
                            },
                            color: { required: false, type: () => String },
                            message: { required: true, type: () => String },
                            isRead: { required: true, type: () => Boolean },
                            recipient: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            workspace: {
                                required: true,
                                type: () =>
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/notifications/dto/create.notification.dto"
                    ),
                    {
                        CreateNotificationDto: {
                            type: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/notifications/index"
                                ].NotificationType,
                            },
                            recipientId: { required: true, type: () => Number },
                            workspaceId: { required: true, type: () => Number },
                            relatedResourceId: {
                                required: false,
                                type: () => String,
                            },
                            relatedResourceType: {
                                required: false,
                                type: () => String,
                            },
                            color: { required: false, type: () => String },
                            message: { required: true, type: () => String },
                            isRead: { required: false, type: () => Boolean },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/user-integrations/user.integration.entity"
                    ),
                    {
                        UserIntegration: {
                            id: { required: true, type: () => String },
                            user: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            type: {
                                required: true,
                                type: () => String,
                                enum: t[
                                    "../../shared/src/lib/integrations/index"
                                ].IntegrationType,
                            },
                            config: { required: true, type: () => Object },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/user-integrations/dto/upsert.user.integration.dto"
                    ),
                    {
                        UpsertUserIntegrationDto: {
                            type: {
                                required: true,
                                type: () => String,
                                enum: t[
                                    "../../shared/src/lib/integrations/index"
                                ].IntegrationType,
                            },
                            config: { required: true, type: () => Object },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/notifications/dto/update.notification.dto"
                    ),
                    { UpdateNotificationDto: {} },
                ],
                [
                    import("./app/common/watchers/watcher.entity"),
                    {
                        Watcher: {
                            id: { required: true, type: () => String },
                            user: {
                                required: true,
                                type: () =>
                                    t["./app/common/users/user.entity"].User,
                            },
                            resourceId: { required: true, type: () => Number },
                            resourceType: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/notifications/index"
                                ].WatchableResourceType,
                            },
                            createdAt: { required: true, type: () => Date },
                            updatedAt: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import("./app/common/watchers/dto/create.watcher.dto"),
                    {
                        CreateWatcherDto: {
                            resourceId: { required: true, type: () => Number },
                            resourceType: {
                                required: true,
                                enum: t[
                                    "../../shared/src/lib/notifications/index"
                                ].WatchableResourceType,
                            },
                            userId: { required: false, type: () => Number },
                        },
                    },
                ],
                [
                    import("./app/common/watchers/dto/update.watcher.dto"),
                    { UpdateWatcherDto: {} },
                ],
            ],
            controllers: [
                [
                    import("./app/common/users/users.controller"),
                    {
                        UsersController: {
                            findAll: { type: Object },
                            findOne: {
                                type: t["./app/common/users/user.entity"].User,
                            },
                            create: {
                                type: t["./app/common/users/user.entity"].User,
                            },
                            update: {
                                type: t["./app/common/users/user.entity"].User,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/auth/controllers/auth.controller"),
                    {
                        AuthController: {
                            login: {
                                description:
                                    "Logs the user in with email and password",
                                type: Object,
                            },
                            register: { type: Object },
                            registerWithInvite: { type: Object },
                            joinInvitation: { type: Object },
                        },
                    },
                ],
                [
                    import("./app/common/projects/projects.controller"),
                    {
                        ProjectsController: {
                            findAll: {
                                type: [
                                    t["./app/common/projects/project.entity"]
                                        .Project,
                                ],
                            },
                            findOne: {
                                type: t["./app/common/projects/project.entity"]
                                    .Project,
                            },
                            create: {
                                type: t["./app/common/projects/project.entity"]
                                    .Project,
                            },
                            update: {
                                type: t["./app/common/projects/project.entity"]
                                    .Project,
                            },
                            remove: {},
                            findOneByInviteCode: {
                                type: t["./app/common/projects/project.entity"]
                                    .Project,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/projects/project-users/project.users.controller"
                    ),
                    {
                        ProjectUsersController: {
                            findAll: {
                                type: [
                                    t[
                                        "./app/common/projects/project-users/project.user.entity"
                                    ].ProjectUser,
                                ],
                            },
                            findOne: {
                                type: t[
                                    "./app/common/projects/project-users/project.user.entity"
                                ].ProjectUser,
                            },
                            create: {
                                type: t[
                                    "./app/common/projects/project-users/project.user.entity"
                                ].ProjectUser,
                            },
                            update: {
                                type: t[
                                    "./app/common/projects/project-users/project.user.entity"
                                ].ProjectUser,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/notifications/notification-preference/notification.preference.controller"
                    ),
                    {
                        NotificationPreferenceController: {
                            getAll: {
                                type: [
                                    t[
                                        "./app/common/notifications/notification-preference/notification.preference.entity"
                                    ].NotificationPreference,
                                ],
                            },
                            getOne: {
                                type: t[
                                    "./app/common/notifications/notification-preference/notification.preference.entity"
                                ].NotificationPreference,
                            },
                            update: {
                                type: t[
                                    "./app/common/notifications/notification-preference/notification.preference.entity"
                                ].NotificationPreference,
                            },
                        },
                    },
                ],
                [
                    import("./app/common/cards/cards.controller"),
                    {
                        CardsController: {
                            search: {
                                type: [
                                    t["./app/common/cards/card.entity"].Card,
                                ],
                            },
                            findAll: { type: Object },
                            findOne: {
                                type: t["./app/common/cards/card.entity"].Card,
                            },
                            create: {
                                type: t["./app/common/cards/card.entity"].Card,
                            },
                            update: {
                                type: t["./app/common/cards/card.entity"].Card,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/cards/card-lists/card.lists.controller"
                    ),
                    {
                        CardListssController: {
                            updateCardList: {
                                type: t[
                                    "./app/common/cards/card-lists/card.list.entity"
                                ].CardList,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/cards/card-activities/card.activities.controller"
                    ),
                    {
                        CardActivitiesController: {
                            find: {
                                type: [
                                    t[
                                        "./app/common/cards/card-activities/card.activity.entity"
                                    ].CardActivity,
                                ],
                            },
                            create: {
                                type: t[
                                    "./app/common/cards/card-activities/card.activity.entity"
                                ].CardActivity,
                            },
                            update: {
                                type: t[
                                    "./app/common/cards/card-activities/card.activity.entity"
                                ].CardActivity,
                            },
                            delete: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/controllers/automations.controller"
                    ),
                    {
                        AutomationsController: {
                            findAll: {
                                type: [
                                    t[
                                        "./app/common/automations/entities/automation.entity"
                                    ].Automation,
                                ],
                            },
                            find: {
                                type: t[
                                    "./app/common/automations/entities/automation.entity"
                                ].Automation,
                            },
                            create: {
                                type: t[
                                    "./app/common/automations/entities/automation.entity"
                                ].Automation,
                            },
                            update: {
                                type: t[
                                    "./app/common/automations/entities/automation.entity"
                                ].Automation,
                            },
                            remove: {},
                            duplicate: {
                                type: t[
                                    "./app/common/automations/entities/automation.entity"
                                ].Automation,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/controllers/automation.handlers.controller"
                    ),
                    {
                        AutomationHandlersController: {
                            findTriggers: { type: [Object] },
                            findActions: { type: [Object] },
                            getHandlerFields: { type: Object },
                            getHandlerSampleData: { type: Object },
                        },
                    },
                ],
                [
                    import("./app/common/fields/fields.controller"),
                    {
                        FieldsController: {
                            findAll: {
                                type: [
                                    t["./app/common/fields/field.entity"].Field,
                                ],
                            },
                            findOne: {
                                type: t["./app/common/fields/field.entity"]
                                    .Field,
                            },
                            create: {
                                type: t["./app/common/fields/field.entity"]
                                    .Field,
                            },
                            update: {
                                type: t["./app/common/fields/field.entity"]
                                    .Field,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/lists/lists.controller"),
                    {
                        ListsController: {
                            findAll: {
                                type: [
                                    t["./app/common/lists/list.entity"].List,
                                ],
                            },
                            findOne: {
                                type: t["./app/common/lists/list.entity"].List,
                            },
                            create: {
                                type: t["./app/common/lists/list.entity"].List,
                            },
                            update: {
                                type: t["./app/common/lists/list.entity"].List,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/lists/list-groups/list.groups.controller"
                    ),
                    {
                        ListGroupsController: {
                            generateGroups: {
                                type: [
                                    t[
                                        "./app/common/lists/list-groups/list.group.entity"
                                    ].ListGroup,
                                ],
                            },
                            updateGroup: {
                                type: t[
                                    "./app/common/lists/list-groups/list.group.entity"
                                ].ListGroup,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/lists/list-stages/list.stages.controller"
                    ),
                    {
                        ListStagesController: {
                            findStages: {
                                type: [
                                    t[
                                        "./app/common/lists/list-stages/list.stage.entity"
                                    ].ListStage,
                                ],
                            },
                            findOne: {
                                type: t[
                                    "./app/common/lists/list-stages/list.stage.entity"
                                ].ListStage,
                            },
                            create: {
                                type: t[
                                    "./app/common/lists/list-stages/list.stage.entity"
                                ].ListStage,
                            },
                            reorder: {
                                type: [
                                    t[
                                        "./app/common/lists/list-stages/list.stage.entity"
                                    ].ListStage,
                                ],
                            },
                            update: {
                                type: t[
                                    "./app/common/lists/list-stages/list.stage.entity"
                                ].ListStage,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/views/views.controller"),
                    {
                        ViewsController: {
                            findAll: {
                                type: [
                                    t["./app/common/views/view.entity"].View,
                                ],
                            },
                            findOne: {
                                type: t["./app/common/views/view.entity"].View,
                            },
                            create: {
                                type: t["./app/common/views/view.entity"].View,
                            },
                            update: {
                                type: t["./app/common/views/view.entity"].View,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/automations/controllers/automation.validation.controller"
                    ),
                    {
                        AutomationValidationController: {
                            validateAutomation: { type: Object },
                            validateStep: { type: Object },
                        },
                    },
                ],
                [
                    import("./app/common/spaces/spaces.controller"),
                    {
                        SpacesController: {
                            findAll: {
                                type: [
                                    t["./app/common/spaces/space.entity"].Space,
                                ],
                            },
                            findOne: {
                                type: t["./app/common/spaces/space.entity"]
                                    .Space,
                            },
                            create: {
                                type: t["./app/common/spaces/space.entity"]
                                    .Space,
                            },
                            update: {
                                type: t["./app/common/spaces/space.entity"]
                                    .Space,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/workspaces/workspaces.controller"),
                    {
                        WorkspacesController: {
                            findAll: {
                                type: [
                                    t[
                                        "./app/common/workspaces/workspace.entity"
                                    ].Workspace,
                                ],
                            },
                            findOne: {
                                type: t[
                                    "./app/common/workspaces/workspace.entity"
                                ].Workspace,
                            },
                            create: {
                                type: t[
                                    "./app/common/workspaces/workspace.entity"
                                ].Workspace,
                            },
                            update: {
                                type: t[
                                    "./app/common/workspaces/workspace.entity"
                                ].Workspace,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/card-types/card.types.controller"),
                    {
                        CardTypesController: {
                            findAll: {
                                type: [
                                    t[
                                        "./app/common/card-types/card.type.entity"
                                    ].CardType,
                                ],
                            },
                            findOne: {
                                type: t[
                                    "./app/common/card-types/card.type.entity"
                                ].CardType,
                            },
                            create: {
                                type: t[
                                    "./app/common/card-types/card.type.entity"
                                ].CardType,
                            },
                            update: {
                                type: t[
                                    "./app/common/card-types/card.type.entity"
                                ].CardType,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/filters/filters.controller"),
                    {
                        FiltersController: {
                            findAll: { type: Object },
                            findOne: {
                                type: t["./app/common/filters/filter.entity"]
                                    .Filter,
                            },
                            create: {
                                type: t["./app/common/filters/filter.entity"]
                                    .Filter,
                            },
                            update: {
                                type: t["./app/common/filters/filter.entity"]
                                    .Filter,
                            },
                            remove: {},
                        },
                    },
                ],
                [
                    import("./app/common/mailer/mailer.controller"),
                    {
                        MailerController: {
                            sendMentionNotificationEmail: {},
                            trackEmailOpen: { type: Object },
                        },
                    },
                ],
                [
                    import("./app/common/files/files.controller"),
                    {
                        FilesController: {
                            getFile: {},
                            uploadFile: {
                                type: t["./app/common/files/file.entity"]
                                    .TWFile,
                            },
                        },
                    },
                ],
                [
                    import(
                        "./app/common/notifications/notification.controller"
                    ),
                    {
                        NotificationController: {
                            create: {
                                type: t[
                                    "./app/common/notifications/notification.entity"
                                ].Notification,
                            },
                            findAll: {
                                type: [
                                    t[
                                        "./app/common/notifications/notification.entity"
                                    ].Notification,
                                ],
                            },
                            update: {
                                type: t[
                                    "./app/common/notifications/notification.entity"
                                ].Notification,
                            },
                            markAllAsRead: {},
                        },
                    },
                ],
                [
                    import("./app/common/watchers/watcher.controller"),
                    {
                        WatcherController: {
                            addWatcher: {
                                type: t["./app/common/watchers/watcher.entity"]
                                    .Watcher,
                            },
                            removeWatcher: {},
                            getWatchers: {
                                type: [
                                    t["./app/common/users/user.entity"].User,
                                ],
                            },
                            isWatching: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/user-integrations/controllers/user.integration.controller"
                    ),
                    {
                        UserIntegrationController: {
                            findAll: {
                                type: [
                                    t[
                                        "./app/common/user-integrations/user.integration.entity"
                                    ].UserIntegration,
                                ],
                            },
                            findByType: {
                                type: t[
                                    "./app/common/user-integrations/user.integration.entity"
                                ].UserIntegration,
                            },
                            getEnabledIntegrations: {},
                            upsert: {
                                type: t[
                                    "./app/common/user-integrations/user.integration.entity"
                                ].UserIntegration,
                            },
                            remove: {},
                            getAuthUrl: {},
                            integrationCallback: {},
                        },
                    },
                ],
                [
                    import(
                        "./app/common/user-integrations/controllers/slack.integration.controller"
                    ),
                    {
                        SlackIntegrationController: {
                            getChannels: { type: Object },
                        },
                    },
                ],
            ],
        },
    };
};
