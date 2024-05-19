/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DIALOGS } from '@/components/common/dialogs/types';
import { defineStore } from 'pinia';

export type DialogOptions = {
  width?: string | number;
  fullscreen?: boolean;
  persistent?: boolean;
};

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    currentDialog: null as null | DIALOGS,
    width: null as null | string | number,
    fullscreen: false as boolean,
    data: {} as any,
    options: {} as DialogOptions,
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
      this.currentDialog = dialog;
      if (options) {
        this.setOptions(options);
      }
      if (data) {
        this.setData(data);
      }
    },
    setData(data: any) {
      if (!data) {
        this.data = {};
        return;
      }

      this.data = data;
    },
    setOptions(options: DialogOptions) {
      this.options = options;
    },
  },
});
