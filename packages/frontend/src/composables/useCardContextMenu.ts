import { useWatcherService } from '@/services/useWatcherService';
import { WatchableResourceType, type Card } from '@tillywork/shared';
import { useCard } from './useCard';
import type { ContextMenuItem } from '@/components/common/base/ContextMenu/types';
import { useSnackbarStore } from '@/stores/snackbar';

export const useCardContextMenu = (card: Card, cb?: () => void) => {
  const isMenuOpen = ref(false);

  const { showSnackbar } = useSnackbarStore();
  const { copyLink, confirmDelete } = useCard();

  const { useGetIsWatching, useCreateWatcher, useRemoveWatcher } =
    useWatcherService();

  const { data: isWatching } = useGetIsWatching({
    resourceId: computed(() => card.id),
    resourceType: WatchableResourceType.CARD,
    enabled: isMenuOpen,
  });

  const { mutateAsync: createWatcher } = useCreateWatcher();
  const { mutateAsync: removeWatcher } = useRemoveWatcher();

  const items = computed(() => {
    const items: ContextMenuItem[] = [
      {
        title: 'Copy link',
        icon: 'mdi-link',
        action: () => copyLink(card, cb),
      },
    ];

    if (isWatching.value?.watching) {
      items.push({
        title: 'Unsubscribe',
        icon: 'mdi-bell-off',
        action: () => removeCardWatcher(card, cb),
      });
    } else {
      items.push({
        title: 'Subscribe',
        icon: 'mdi-bell',
        action: () => watchCard(card, cb),
      });
    }

    items.push({
      title: 'Delete',
      icon: 'mdi-delete-outline',
      action: () => confirmDelete(card, cb),
      shortcut: ['DEL'],
    });

    return items;
  });

  function watchCard(card: Card, cb?: () => void) {
    createWatcher({
      resourceId: card.id,
      resourceType: WatchableResourceType.CARD,
    }).catch(() => {
      showSnackbar({
        color: 'error',
        message: 'Something went wrong, please try again.',
      });
    });

    if (cb) {
      cb();
    }
  }

  function removeCardWatcher(card: Card, cb?: () => void) {
    removeWatcher({
      resourceId: card.id,
      resourceType: WatchableResourceType.CARD,
    }).catch(() => {
      showSnackbar({
        color: 'error',
        message: 'Something went wrong, please try again.',
      });
    });

    if (cb) {
      cb();
    }
  }

  function onUpdateMenuOpen(isOpen: boolean) {
    isMenuOpen.value = isOpen;
  }

  return {
    items,
    onUpdateMenuOpen,
  };
};
