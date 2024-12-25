import { useListsService } from '@/services/useListsService';

import { useAuthStore } from '@/stores/auth';

import { WorkspaceTypes, type CardType } from '@tillywork/shared';

export const useCrm = () => {
  const { workspace } = storeToRefs(useAuthStore());
  const { useGetListsQuery } = useListsService();

  const workspaceId = computed(() => workspace.value?.id);
  const listsQueryEnabled = computed(
    () => !!workspace.value && workspace.value.type === WorkspaceTypes.CRM
  );

  const { data: lists } = useGetListsQuery({
    workspaceId: workspaceId as Ref<number>,
    enabled: listsQueryEnabled,
  });

  function getListBySlug(slug: string) {
    return lists.value?.find((list) => list.slug.match(slug));
  }

  function getListByCardType(cardType: CardType) {
    return lists.value?.find((list) => list.defaultCardType.id === cardType.id);
  }

  return {
    lists,
    getListBySlug,
    getListByCardType,
  };
};
