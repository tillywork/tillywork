export const useHideNavigationDrawer = () => {
  const route = useRoute();
  const navigationDrawer = ref(true);

  watch(
    route,
    () => {
      if (route.meta.hideNavigationDrawer) {
        navigationDrawer.value = false;
      } else {
        navigationDrawer.value = true;
      }
    },
    { immediate: true }
  );

  return {
    navigationDrawer,
  };
};
