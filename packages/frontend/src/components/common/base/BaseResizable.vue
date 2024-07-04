<script setup lang="ts">
import type { VSheet } from 'vuetify/components';

const width = defineModel<number>('width');
const height = defineModel<number>('height');

const props = defineProps<{
  disabled?: boolean;
}>();

const resizing = ref<'right' | 'left' | null>(null);
const resizableElement = ref<VSheet | null>(null);

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
  // Maintain aspect ratio
  const ratio = boundingRect.width / boundingRect.height;

  if (resizing.value === 'left') {
    const deltaX = boundingRect.right - event.clientX + 5;
    const deltaY = event.clientY - boundingRect.top;

    if (!width.value) {
      width.value = deltaX;
    }
    if (!height.value) {
      height.value = deltaY;
    }

    // Maintain aspect ratio
    const ratio = width.value / height.value;
    if (deltaX / deltaY > ratio) {
      width.value = deltaX;
      height.value = deltaX / ratio;
    } else {
      height.value = deltaY;
      width.value = deltaY * ratio;
    }
  } else if (resizing.value === 'right') {
    const deltaX = event.clientX - boundingRect.left + 5;
    const deltaY = event.clientY - boundingRect.top;

    if (deltaX / deltaY > ratio) {
      width.value = deltaX;
      height.value = deltaX / ratio;
    } else {
      height.value = deltaY;
      width.value = deltaY * ratio;
    }
  }
}

function stopResize() {
  resizing.value = null;
  window.removeEventListener('mousemove', resize);
  window.removeEventListener('mouseup', stopResize);
}
</script>

<template>
  <div class="d-flex align-center justify-center w-100">
    <v-sheet
      ref="resizableElement"
      color="transparent"
      class="resizable position-relative"
      :width="width ?? '100%'"
      :height
    >
      <template v-if="resizing || !disabled">
        <div
          class="resizer resizer-right"
          @mousedown.stop.prevent="initResize('right')"
        ></div>
        <div
          class="resizer resizer-left"
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
