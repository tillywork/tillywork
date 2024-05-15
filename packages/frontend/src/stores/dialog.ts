import type { DIALOGS } from '@/components/common/dialogs/types';
import { defineStore } from 'pinia';

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    currentDialog: null as null | DIALOGS,
    width: null as null | string | number,
    dialogData: {} as any,
  }),

  actions: {
    openDialog({
      dialog,
      data,
      width,
    }: {
      dialog: DIALOGS | null;
      data?: any;
      width?: string | number;
    }) {
      console.debug(dialog, data, width);
      this.currentDialog = dialog;
      if (width) {
        this.setWidth(width);
      }
      if (data) {
        this.setDialogData(data);
      }
    },
    setDialogData(data: any) {
      if (!data) {
        this.dialogData = {};
        return;
      }

      this.dialogData = data;
    },
    setWidth(width: string | number) {
      this.width = width;
    },
  },
});
