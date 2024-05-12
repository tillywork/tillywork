import { DIALOG_WIDTHS, type DIALOGS } from '@/components/common/dialogs/types';
import { useDialogStore } from '@/stores/dialog';

export const useDialog = () => {
  const dialogStore = useDialogStore();

  function openDialog(dialog: DIALOGS, data?: any) {
    dialogStore.openDialog({
      dialog,
      width: DIALOG_WIDTHS[dialog] ?? 750,
      data,
    });
  }

  function closeDialog() {
    dialogStore.openDialog({ dialog: null });
    dialogStore.setDialogData({});
  }

  return {
    openDialog,
    closeDialog,
    data: dialogStore.dialogData,
  };
};
