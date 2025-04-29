<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar';

import { useHttp } from '@/composables/useHttp';

import { useIntegrationsService } from '@/services/useIntegrationsService';

import { IntegrationType } from '@tillywork/shared';

import slackLogo from '@/assets/logos/slack.png';

const { showSnackbar } = useSnackbarStore();

const { sendRequest } = useHttp();

const { useGetIntegration, useDeleteIntegration } = useIntegrationsService();

const { data: integration, isFetching } = useGetIntegration({
  type: IntegrationType.SLACK,
});

const { mutateAsync: deleteIntegration, isPending: isDeleting } =
  useDeleteIntegration();

async function connectSlack() {
  const { url } = await sendRequest('/user-integrations/auth', {
    params: {
      integration: IntegrationType.SLACK,
    },
  });

  window.open(url);
}

function disconnect() {
  deleteIntegration({ type: IntegrationType.SLACK }).catch(() => {
    showSnackbar({
      color: 'error',
      message: 'Something went wrong, please try again.',
    });
  });
}
</script>

<template>
  <v-list-item border="thin">
    <v-list-item-title class="text-body-1 d-flex align-center">
      <v-img class="me-1" :src="slackLogo" alt="Slack" width="36" inline />
      Slack
    </v-list-item-title>
    <template #append>
      <template v-if="!integration">
        <v-btn
          class="text-body-2"
          variant="tonal"
          :loading="isFetching"
          @click="connectSlack"
        >
          Connect
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          class="text-body-2"
          color="error"
          variant="outlined"
          :loading="isDeleting"
          @click="disconnect"
        >
          Disconnect
        </v-btn>
      </template>
    </template>
  </v-list-item>
</template>
