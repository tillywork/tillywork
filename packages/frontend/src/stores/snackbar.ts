export type SnackbarOptions = {
  message: string;
  color?: string;
  timeout?: number;
};

export type Snackbar = {
  id: number;
  options: SnackbarOptions;
  timeoutById?: number;
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
      const timeout = options.timeout ? options.timeout + 300 : 3300;
      const timeoutById = setTimeout(() => {
        this.closeSnackbar(id);
      }, timeout);

      this.snackbars.push({ id, options, timeoutById });
      return id;
    },

    /**
     * Removes an existing snackbar from the store based on its ID.
     * @param id - The ID of the snackbar to be removed.
     */
    closeSnackbar(id: number): void {
      const index = this.snackbars.findIndex((snackbar) => snackbar.id === id);
      if (index === -1) return;
      clearTimeout(this.snackbars[index].timeoutById);
      this.snackbars.splice(index, 1);
    },
  },
});
