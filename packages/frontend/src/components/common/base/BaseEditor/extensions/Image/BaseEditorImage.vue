<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const menu = ref(false);

function showMenu() {
  menu.value = true;
}

function hideMenu() {
  menu.value = false;
}

function copyImageLink() {
  const { copy } = useClipboard();
  copy(props.node.attrs.src);
}

function downloadImage() {
  const link = document.createElement('a');
  link.href = props.node.attrs.src;
  link.download = 'image';
  link.click();
}
</script>

<template>
  <node-view-wrapper>
    <div
      class="image-wrapper rounded-sm position-relative"
      :onmouseenter="showMenu"
      :onmouseleave="hideMenu"
      draggable="true"
      data-drag-handle
    >
      <v-img v-bind="node.attrs" class="rounded-sm" />
      <div class="image-bubble-menu" v-show="menu">
        <div class="v-card bg-accent border-thin d-flex pa-1 ga-1">
          <base-icon-btn
            icon="mdi-content-copy"
            @click="copyImageLink"
            v-tooltip="'Copy link'"
          />
          <base-icon-btn
            icon="mdi-download"
            @click="downloadImage"
            v-tooltip="'Download'"
          />
        </div>
      </div>
    </div>
  </node-view-wrapper>
</template>

<style lang="scss" scoped>
.image-wrapper {
  padding: 0;
  display: flex;

  .v-img,
  img {
    padding: 0;
  }

  .image-bubble-menu {
    position: absolute;
    top: 3px;
    right: 3px;
  }
}
</style>

<style lang="scss">
.tiptap[contenteditable='true'] {
  .ProseMirror-selectednode {
    .image-wrapper {
      outline: 2px solid rgb(var(--v-theme-primary));
    }
  }
}
</style>
