<script setup lang="ts">
import { useFilesService } from '@/composables/services/useFilesService';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const { formatBytes } = useFilesService();

const menu = ref(false);

function showMenu() {
  menu.value = true;
}

function hideMenu() {
  menu.value = false;
}

function copyFileLink() {
  const { copy } = useClipboard();
  copy(props.node.attrs.url);
}

function downloadFile() {
  const link = document.createElement('a');
  link.href = props.node.attrs.url;
  link.download = 'file';
  link.click();
}
</script>

<template>
  <node-view-wrapper>
    <div
      class="file-wrapper rounded-md position-relative"
      :onmouseenter="showMenu"
      :onmouseleave="hideMenu"
    >
      <v-chip color="primary" size="small">
        {{ node.attrs.name }}
        <span class="ms-1">({{ formatBytes(node.attrs.size) }})</span>
        <template #append>
          <div class="d-flex align-start ga-1 ms-2">
            <base-icon-btn
              icon="mdi-content-copy"
              @click="copyFileLink"
              v-tooltip="'Copy link'"
              size="x-small"
            />
            <base-icon-btn
              icon="mdi-download"
              @click="downloadFile"
              v-tooltip="'Download'"
              size="x-small"
            />
          </div>
        </template>
      </v-chip>
    </div>
  </node-view-wrapper>
</template>
