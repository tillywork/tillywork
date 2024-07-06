<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import BaseResizable from '../../../BaseResizable.vue';

const props = defineProps(nodeViewProps);
const menu = ref(false);
const imageWidth = ref<number>(props.node.attrs.width);
const imageHeight = ref<number>(props.node.attrs.height);

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
  link.target = '_blank';
  link.download = 'image';
  link.click();
}

watch([imageWidth, imageHeight], ([newWidth, newHeight]) => {
  props.updateAttributes({
    height: newHeight,
    width: newWidth,
  });
});
</script>

<template>
  <node-view-wrapper>
    <div
      class="image-wrapper rounded-md position-relative mb-2"
      :onmouseenter="showMenu"
      :onmouseleave="hideMenu"
      draggable="true"
      data-drag-handle
    >
      <base-resizable
        :disabled="!menu || !editor.isEditable"
        v-model:width="imageWidth"
        v-model:height="imageHeight"
      >
        <v-img
          v-bind="node.attrs"
          class="image rounded-md"
          :width="imageWidth"
          :height="imageHeight"
        />
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
      </base-resizable>
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
    z-index: 2;
  }
}
</style>

<style lang="scss">
.tiptap[contenteditable='true'] {
  .ProseMirror-selectednode {
    .image {
      outline: 2px solid rgb(var(--v-theme-primary));
    }
  }
}
</style>
