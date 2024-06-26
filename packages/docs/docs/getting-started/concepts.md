---
description: General concepts to be aware of
---

# General Concepts

There are a few general concepts to be aware of when using tillywork.

## Project Hierarchy

tillywork uses a 4-tier hierarchy system:

- Projects: Contain your workspaces, team members, and subscription information
- Workspaces: Contain your work for a certain application (project management, CRM, etc..)
- Spaces: Contain your lists
- Lists: Contain your cards (tasks, contacts, etc..)

## Card Entity

The card entity is tillywork's "atomic entity", that is used to define card types like tasks, contacts, and more. For each workspace, you can create custom card types, and assign these types to lists.

### Creating Card Types

To create a new card type:

:::tip Using the command dialog
You can use the keyboard shortcut `Ctrl+K` or `Cmd+K` to open the command dialog, then search for card types to open the settings dialog to skip the first 2 steps.
:::

1. Open the Settings dialog
2. Go to Card types tab
3. Click the + next to the tab title
4. Enter card type name (e.g Contact)
5. Click create, and close the Settings dialog
6. In the navigation drawer (where your spaces and lists show), find the list you want to assign this card type to
7. Open the list menu by hovering on the list and clicking the 3 dot icon
8. Go to Default card type
9. Select the card type you want for the list

### Deleting Card Types

To delete a card type:

1. Go to the Settings dialog, card types tab
2. Click the 3 dot icon next to the card type you want to delete
3. From the list, click Delete
4. You will have to select a replacement card type. The lists and cards that are assigned to the deleted card type will be replaced with the type you select here
5. Click Delete

:::info System Card Types
You can only edit or delete card types created by yourself or one of your team members. Card types created by the system cannot be changed.
:::

## Custom Fields

Sometimes you will need fields that do not exist in the system. Luckily, you can easily create and define custom fields in tillywork.

### Custom Field Types

Field types that are currently supported:

1. Short Text
2. Dropdown
3. Label
4. Date
5. User

### Creating Custom Fields

To create a new custom field:

1. Open the command dialog with `Ctrl+K` or `Cmd+K`
2. Search for custom fields and hit enter
3. Click the + icon next to the title
4. Enter a field name and select the field type
5. For dropdown and label inputs, make sure to add the options
6. Click create
7. The field will now show when you open a card under the properties section

Currently, any custom field you create will show up under all lists and card types in your workspace.

### Updating Custom Fields

To update a custom field:

1. Open the command dialog with `Ctrl+K` or `Cmd+K`
2. Search for custom fields and hit enter
3. Click on the field you want to edit
4. Update the field and click save

:::info Limitations
When updating custom fields, you cannot change the field type. You can only change the name and the options (in case the field is a label or dropdown field)
:::

## Command Dialog

The command dialog allows you to execute actions with ease, from anywhere in the application.

### Opening the Command Dialog

The global keyboard shortcut to open the command dialog is `Ctrl+K` on Windows keyboards and `Cmd+K` on Mac keyboards.
