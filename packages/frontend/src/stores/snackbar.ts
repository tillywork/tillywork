export type SnackbarOptions = {
  message: string;
  color?: string;
  timeout?: number;
  showConfirm?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
};

export type Snackbar = {
  id: number;
  options: SnackbarOptions;
  timeout?: number;
};

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    snackbars: [] as Snackbar[],
    nextId: 0,
  }),

  actions: {
    /**
     * Adds a new snackbar to the store with the provided options.
     * @param options - Snackbar display options.
     * @returns The ID of the created snackbar.
     */
    showSnackbar(options: SnackbarOptions): number {
      const id = this.nextId++;
      const timeout = options.timeout ?? 4000;

      this.snackbars.push({ id, options, timeout });
      return id;
    },

    /**
     * Removes an existing snackbar from the store based on its ID.
     * @param id - The ID of the snackbar to be removed.
     */
    closeSnackbar(id: number): void {
      const index = this.snackbars.findIndex((snackbar) => snackbar.id === id);
      if (index === -1) return;
      this.snackbars.splice(index, 1);
    },
  },
});
