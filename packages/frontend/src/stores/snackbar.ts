import { defineStore } from 'pinia';

export type SnackbarOptions = {
  message: string;
  color?: string;
  timeout?: number;
};

export type Snackbar = {
  id: number;
  options: SnackbarOptions;
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
      console.log(options);
      const id = this.nextId++;
      this.snackbars.push({ id, options });
      return id;
    },

    /**
     * Removes an existing snackbar from the store based on its ID.
     * @param id - The ID of the snackbar to be removed.
     */
    closeSnackbar(id: number): void {
      this.snackbars = this.snackbars.filter((snackbar) => snackbar.id !== id);
    },
  },
});
