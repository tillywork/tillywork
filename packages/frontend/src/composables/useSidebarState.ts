import { ref } from 'vue';

const isSidebarOpen = ref(false);

export function useSidebarState() {
  function openSidebar() {
    isSidebarOpen.value = true;
  }

  function closeSidebar() {
    isSidebarOpen.value = false;
  }

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  };
}
