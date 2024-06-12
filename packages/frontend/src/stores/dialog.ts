/* eslint-disable @typescript-eslint/no-explicit-any */
import { DIALOG_WIDTHS, type DIALOGS } from '@/components/common/dialogs/types';

export type DialogOptions = {
  width?: string | number;
  fullscreen?: boolean;
  persistent?: boolean;
};

export type Dialog = {
  dialog: DIALOGS | null;
  data?: any;
  options?: DialogOptions;
};

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    dialogs: [] as Dialog[],
  }),

  actions: {
    openDialog({
      dialog,
      data,
      options,
    }: {
      dialog: DIALOGS | null;
      data?: any;
      options?: DialogOptions;
    }) {
      console.debug(dialog, data, options);
      if (dialog && this.getDialogIndex(dialog) === -1) {
        this.dialogs.push({
          dialog,
          data,
          options: {
            width:
              dialog && !options?.fullscreen
                ? DIALOG_WIDTHS[dialog]
                : undefined,
            ...options,
          },
        });
      }
    },
    closeDialog(index: number) {
      this.dialogs.splice(index, 1);
    },
    closeAllDialogs() {
      this.dialogs = [];
    },
    updateDialogOptions(index: number, options: DialogOptions) {
      if (this.dialogs[index]) {
        this.dialogs[index].options = {
          ...this.dialogs[index].options,
          ...options,
        };
      }
    },
    updateDialogData(index: number, data: any) {
      if (this.dialogs[index]) {
        this.dialogs[index].data = { ...this.dialogs[index].data, ...data };
      }
    },
    getDialogIndex(dialog: DIALOGS) {
      return this.dialogs.findIndex((d) => d.dialog === dialog);
    },
  },
});
