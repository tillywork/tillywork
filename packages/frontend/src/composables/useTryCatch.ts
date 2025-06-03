import { useSnackbarStore } from '@/stores/snackbar';

export const useTryCatch = () => {
  const { showSnackbar } = useSnackbarStore();

  function showErrorSnackbar() {
    showSnackbar({
      message: 'Something went wrong, please try again.',
      color: 'error',
    });
  }

  function tryCatch(fn: () => unknown) {
    try {
      fn();
    } catch {
      showErrorSnackbar();
    }
  }

  return {
    tryCatch,
  };
};
