import { useSnackbarStore } from '@/stores/snackbar';

export function useSnackbar() {
  const { showSnackbar } = useSnackbarStore();

  return {
    showSnackbar,
  };
}
