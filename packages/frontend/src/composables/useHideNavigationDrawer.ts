export const useHideNavigationDrawer = () => {
  const route = useRoute();
  const hideNavigationDrawer = ref(true);

  watch(
    route,
    () => {
      if (route.meta.hideNavigationDrawer) {
        hideNavigationDrawer.value = true;
      } else {
        hideNavigationDrawer.value = false;
      }
    },
    { immediate: true }
  );

  return {
    hideNavigationDrawer,
  };
};
