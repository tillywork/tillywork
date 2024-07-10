<script setup lang="ts">
import type { VSheet } from 'vuetify/components';

const width = defineModel<number>('width');
const height = defineModel<number>('height');

const props = defineProps<{
  disabled?: boolean;
  maxWidth?: number;
}>();

const resizing = ref<'right' | 'left' | null>(null);
const resizableElement = ref<VSheet | null>(null);
const minWidth = ref(150);

function initResize(direction: 'right' | 'left') {
  if (props.disabled) {
    return;
  }

  resizing.value = direction;
  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', stopResize);
}

function resize(event: MouseEvent) {
  if (!resizableElement.value || props.disabled) {
    return;
  }

  const boundingRect = resizableElement.value.$el.getBoundingClientRect();
  const ratio = boundingRect.width / boundingRect.height;
  let deltaX: number = boundingRect.width;

  if (resizing.value === 'left') {
    deltaX = boundingRect.right - event.clientX + 5;
  } else if (resizing.value === 'right') {
    deltaX = event.clientX - boundingRect.left + 5;
  }

  const newWidth = Math.max(
    Math.min(deltaX, props.maxWidth ?? deltaX),
    minWidth.value
  );
  width.value = newWidth;
  height.value = newWidth / ratio;
}

function stopResize() {
  resizing.value = null;
  window.removeEventListener('mousemove', resize);
  window.removeEventListener('mouseup', stopResize);
}

onMounted(() => {
  if (!width.value) {
    width.value = resizableElement.value?.$el.getBoundingClientRect().width;
  }
});
</script>

<template>
  <div class="d-flex align-center justify-center w-100">
    <v-sheet
      ref="resizableElement"
      color="transparent"
      class="resizable position-relative"
      :width="width ?? '100%'"
      :height
      :min-width="minWidth"
      :max-width="maxWidth"
    >
      <template v-if="resizing || !disabled">
        <div
          class="resizer resizer-right elevation-6"
          @mousedown.stop.prevent="initResize('right')"
        ></div>
        <div
          class="resizer resizer-left elevation-6"
          @mousedown.stop.prevent="initResize('left')"
        ></div>
      </template>

      <slot />
    </v-sheet>
  </div>
</template>

<style scoped lang="scss">
.resizable {
  position: relative;
}

.resizer {
  width: 4px;
  height: 40px;
  max-height: 80%;
  background: rgba(white, 0.8);
  position: absolute;
  z-index: 1;
  border-radius: 6px;
}

.resizer-right {
  right: 5px;
  top: 50%;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.resizer-left {
  left: 5px;
  top: 50%;
  cursor: ew-resize;
  transform: translateY(-50%);
}
</style>
