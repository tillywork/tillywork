import type { MaybeRef } from 'vue';
import type { VList } from 'vuetify/components';

interface UseListKeyboardNavigationOptions {
  /**
   * Whether to enable keyboard navigation
   */
  enabled?: MaybeRef<boolean>;
  /**
   * Whether to enable wrapping around from last to first item and vice versa
   */
  wrap?: boolean;
  /**
   * Element query selector for the list items
   */
  itemSelector?: string;
  /**
   * Whether to prevent default keyboard event behavior
   */
  preventDefault?: boolean;
}

export function useListKeyboardNavigation({
  enabled = true,
  wrap,
  itemSelector = '.v-list-item',
  preventDefault,
}: UseListKeyboardNavigationOptions = {}) {
  const activeIndex = ref(0);
  const containerRef = ref<VList | null>(null);

  const getItems = (): HTMLElement[] => {
    if (!containerRef.value) return [];
    return Array.from(containerRef.value.$el.querySelectorAll(itemSelector));
  };

  const navigateList = (direction: 'up' | 'down') => {
    const items = getItems();
    if (items.length === 0) return;

    let newIndex: number;
    if (direction === 'down') {
      newIndex = wrap
        ? (activeIndex.value + 1) % items.length
        : Math.min(activeIndex.value + 1, items.length - 1);
    } else {
      newIndex = wrap
        ? (activeIndex.value - 1 + items.length) % items.length
        : Math.max(activeIndex.value - 1, 0);
    }

    activeIndex.value = newIndex;

    nextTick(() => {
      ensureActiveItemVisible();
    });
  };

  const ensureActiveItemVisible = () => {
    const items = getItems();
    const activeItem = items[activeIndex.value];

    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!toValue(enabled)) return;

    switch (event.key) {
      case 'ArrowDown':
        if (preventDefault) event.preventDefault();
        navigateList('down');
        break;
      case 'ArrowUp':
        if (preventDefault) event.preventDefault();
        navigateList('up');
        break;
      case 'Enter': {
        if (preventDefault) event.preventDefault();

        const items = getItems();
        const activeItem = items[activeIndex.value];
        if (activeItem) {
          activeItem.click();
        }
        break;
      }
    }
  };

  const reset = () => {
    activeIndex.value = 0;
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    activeIndex,
    containerRef,
    reset,
    navigateList,
  };
}
