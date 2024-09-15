import { DIALOGS } from '@/components/common/dialogs/types';
import type { ListGroup } from '@/components/project-management/lists/types';
import { useDialogStore } from '@/stores/dialog';
import {
  type ListStage,
  ListGroupOptions,
  type User,
  FieldTypes,
  type ProjectUser,
} from '@tillywork/shared';

export const useListGroup = (props: {
  listStages: ListStage[];
  projectUsers: ProjectUser[];
}) => {
  const dialog = useDialogStore();

  function openCreateCardDialog(listGroup: ListGroup) {
    const cardData: Record<string, unknown> = {};

    if (
      listGroup.type === ListGroupOptions.FIELD &&
      listGroup.field?.type === FieldTypes.USER
    ) {
      cardData[listGroup.field.slug] = getGroupUser(listGroup);
    }

    dialog.openDialog({
      dialog: DIALOGS.CREATE_CARD,
      data: {
        listId: listGroup.list.id,
        listStage: getGroupStage(listGroup),
        data: cardData,
        listStages: props.listStages,
      },
    });
  }

  function getGroupStage(group: ListGroup) {
    let stage: ListStage | undefined;

    if (group.type === ListGroupOptions.LIST_STAGE) {
      stage = props.listStages.find((stage) => {
        return stage.id == group.entityId;
      });
    }

    return stage ? { ...stage } : undefined;
  }

  function getGroupUser(group: ListGroup) {
    let user: User | undefined;

    if (
      group.type === ListGroupOptions.FIELD &&
      group.field?.type === FieldTypes.USER
    ) {
      user = props.projectUsers.find((user: ProjectUser) => {
        return user.user.id == group.entityId;
      })?.user;
    }

    return user ? [user.id.toString()] : undefined;
  }

  return {
    openCreateCardDialog,
  };
};
