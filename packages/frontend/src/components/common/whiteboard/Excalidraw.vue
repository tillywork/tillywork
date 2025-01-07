<script setup lang="ts">
import { applyPureReactInVue } from 'veaury';

import { Excalidraw } from '@excalidraw/excalidraw';

import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { useThemeStore } from '@/stores/theme';

const ExcalidrawComponent = applyPureReactInVue(Excalidraw);

const excalidrawAPI = ref<ExcalidrawImperativeAPI | null>(null);

const { theme } = storeToRefs(useThemeStore());

const onReady = (api: ExcalidrawImperativeAPI) => {
  excalidrawAPI.value = api;
};
</script>

<template>
  <div style="width: 100%; height: 100%" class="tw-styles">
    <ExcalidrawComponent :theme :excalidrawAPI="onReady" />
  </div>
</template>

<style lang="scss">
.tw-styles {
  .excalidraw {
    .popover {
      box-shadow: none;

      li {
        padding: 0 5px;
      }

      .context-menu {
        border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));

        .context-menu-item {
          &:hover {
            color: rgb(var(--v-theme-on-surface));
            background-color: rgba(
              var(--v-theme-surface-variant),
              var(--v-hover-opacity)
            );
          }

          padding: 0.25rem 0;
          color: rgb(var(--v-theme-on-surface));
          border-radius: 6px;

          .context-menu-item__label {
            padding-left: 1rem;
            font-size: 0.85rem;
          }

          .context-menu-item__shortcut {
            font-size: 0.7rem;
            padding-right: 1rem;
          }
        }

        hr {
          margin-top: 8px;
          margin-bottom: 8px;
          opacity: 0.2;
        }
      }
    }
  }
}

.excalidraw {
  .confirm-dialog-buttons {
    margin-top: 15px;
  }

  .Dialog__action-button {
    padding: 0.2rem 1rem !important;
    height: 2.5rem;
  }
}
</style>
