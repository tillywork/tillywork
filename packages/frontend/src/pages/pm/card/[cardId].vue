<script setup lang="ts">
import BaseCard from '@/components/project-management/cards/BaseCard.vue';
import { useCardsService } from '@/composables/services/useCardsService';

import { type CreateProjectUserActivityDTO } from '@/components/common/projects/types';
import { useProjectUserActivityService } from '@/composables/services/useProjectUserActivityService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute('/pm/card/[cardId]');
const router = useRouter();

const cardsService = useCardsService();
const cardId = computed(() => +route.params.cardId);

const {
  data: card,
  error,
  refetch,
} = cardsService.useGetCardQuery({
  cardId,
});

const { useCreateProjectUserActivityMutation } =
  useProjectUserActivityService();
const { mutateAsync: createProjectUserActivity } =
  useCreateProjectUserActivityMutation();

function storeActivity() {
  const activity: CreateProjectUserActivityDTO = {
    type: 'ENTITY',
    entityType: 'CARD',
    entityId: cardId.value,
  };

  createProjectUserActivity({
    activity,
  });
}

watch(
  card,
  (v) => {
    if (v) {
      storeActivity();
      document.title = `${v.title} - tillywork`;
    }
  },
  { immediate: true }
);

watch(error, (v: any) => {
  if (v.response.status === 404) {
    router.push('/');
  }
});

watch(
  () => route.params.cardId,
  () => refetch()
);
</script>

<template>
  <base-card v-if="card" :card />
</template>
