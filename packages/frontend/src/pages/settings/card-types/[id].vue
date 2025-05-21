<script setup lang="ts">
import { useCardTypesService } from '@/services/useCardTypesService';

import SettingsLayout from '@/layouts/SettingsLayout.vue';
import CardTypeDetails from '@/components/common/card-types/CardTypeDetails.vue';

definePage({
  meta: {
    requiresAuth: true,
    hideNavigationDrawer: true,
  },
});

const route = useRoute('/settings/card-types/[id]');

const { useFindCardType } = useCardTypesService();

const { data: cardType } = useFindCardType({
  cardTypeId: computed(() => route.params.id),
});
</script>

<template>
  <SettingsLayout>
    <template v-if="cardType">
      <CardTypeDetails :cardType />
    </template>
  </SettingsLayout>
</template>
