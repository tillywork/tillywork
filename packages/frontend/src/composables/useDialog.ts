/* eslint-disable @typescript-eslint/no-explicit-any */
import { DIALOG_WIDTHS, type DIALOGS } from '@/components/common/dialogs/types';
import { useDialogStore, type DialogOptions } from '@/stores/dialog';

export const useDialog = () => {
  const dialogStore = useDialogStore();

  function openDialog({
    dialog,
    data,
    options,
  }: {
    dialog: DIALOGS;
    data?: any;
    options?: DialogOptions;
  }) {
    dialogStore.openDialog({
      dialog,
      data,
      options: {
        width: options?.width ?? DIALOG_WIDTHS[dialog],
        fullscreen: options?.fullscreen,
        persistent: options?.persistent,
      },
    });
  }

  function closeDialog() {
    dialogStore.openDialog({ dialog: null });
    dialogStore.setData({});
    dialogStore.setOptions({});
  }

  return {
    openDialog,
    closeDialog,
    data: dialogStore.data,
    options: dialogStore.options,
  };
};
