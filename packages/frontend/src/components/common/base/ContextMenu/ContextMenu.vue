<script setup lang="ts">
import tippy, { type Instance, animateFill } from 'tippy.js';

import MenuWrapper from './MenuWrapper.vue';

import type { ContextMenuItem } from './types';

import vuetify from '@/plugins/vuetify';

import 'tippy.js/animations/shift-away.css';

const { items } = defineProps<{
  items: ContextMenuItem[];
}>();

let tippyInstance: Instance | null = null;
let menuApp: ReturnType<typeof createApp> | null = null;

const triggerElement = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

function showMenu(e?: MouseEvent) {
  if (!tippyInstance) return;

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

onMounted(() => {
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
    items,
    tippy: tippyInstance,
  });
  menuApp.use(vuetify);
  menuApp.mount(menuContainer);

  triggerElement.value.addEventListener('contextmenu', handleContextMenu);
});

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  showMenu(e);
};

onBeforeUnmount(() => {
  if (triggerElement.value) {
    triggerElement.value.removeEventListener('contextmenu', handleContextMenu);
  }
  menuApp?.unmount();
  tippyInstance?.destroy();
});

defineExpose({ showMenu, hideMenu, isMenuOpen });
</script>

<template>
  <div ref="triggerElement">
    <slot :showMenu :hideMenu :isMenuOpen></slot>
  </div>
</template>
