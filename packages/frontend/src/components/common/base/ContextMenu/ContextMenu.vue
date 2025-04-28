<script setup lang="ts">
import tippy, { type Instance, animateFill } from 'tippy.js';

import MenuWrapper from './MenuWrapper.vue';

import type { ContextMenuItem } from './types';

import vuetify from '@/plugins/vuetify';

import 'tippy.js/animations/shift-away.css';
import { isEqual } from 'lodash';

const selectedItems = defineModel<unknown | unknown[] | null>({
  default: null,
});

const { items, selectable, multiple } = defineProps<{
  items: ContextMenuItem[];
  selectable?: boolean;
  multiple?: boolean;
}>();

const emit = defineEmits(['update:open']);

let tippyInstance: Instance | null = null;
let menuApp: ReturnType<typeof createApp> | null = null;

const triggerElement = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

function showMenu(e?: MouseEvent) {
  if (!tippyInstance) return;

  //FIX: if this is called with an event, then called without event, the location doesn't reset
  if (e) {
    tippyInstance.setProps({
      getReferenceClientRect: createClientRect(e),
    });
  }

  tippyInstance.show();
  isMenuOpen.value = true;
}

function hideMenu() {
  if (!tippyInstance) return;

  tippyInstance.hide();
  isMenuOpen.value = false;
}

function createClientRect(e: MouseEvent) {
  const rect = {
    width: 0,
    height: 0,
    top: e.clientY,
    bottom: e.clientY,
    left: e.clientX,
    right: e.clientX,
    x: e.clientX,
    y: e.clientY,
    toJSON: () => rect,
  };

  return () => rect;
}

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  showMenu(e);
};

function handleItemSelected(v: unknown | unknown[]) {
  selectedItems.value = v;
}

function setup() {
  if (!triggerElement.value) return;

  const menuContainer = document.createElement('div');

  tippyInstance = tippy(triggerElement.value, {
    content: menuContainer,
    trigger: 'manual',
    interactive: true,
    placement: 'bottom-start',
    offset: [0, 5],
    appendTo: () => document.body,
    animateFill: true,
    plugins: [animateFill],
  });

  menuApp = createApp(MenuWrapper, {
    items: toRef(() => items),
    tippy: tippyInstance,
    selectable,
    multiple,
    modelValue: selectedItems.value,
    onUpdateModelValue: (value: unknown | unknown[]) => {
      handleItemSelected(value);
    },
  });
  menuApp.use(vuetify);
  menuApp.mount(menuContainer);

  triggerElement.value.addEventListener('contextmenu', handleContextMenu);
}

function cleanup() {
  if (triggerElement.value) {
    triggerElement.value.removeEventListener('contextmenu', handleContextMenu);
  }
  menuApp?.unmount();
  tippyInstance?.destroy();
}

onMounted(setup);
onBeforeUnmount(cleanup);

defineExpose({ showMenu, hideMenu, isMenuOpen });

watch(isMenuOpen, (v) => {
  emit('update:open', v);
});
</script>

<template>
  <div ref="triggerElement">
    <slot :showMenu :hideMenu :isMenuOpen></slot>
  </div>
</template>
