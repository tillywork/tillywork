<script setup lang="ts">
import { VDivider, VListItem } from 'vuetify/components';

import BaseContextMenuList from '@/components/common/base/BaseContextMenu/BaseContextMenuList.vue';

const availableComponents = ['divider', 'item'] as const;
type AvailableComponents = (typeof availableComponents)[number];

type VDividerProps = {
  type: 'divider';
  props?: VDivider['$props'];
};
type VListItemProps = {
  type: 'item';
  props: VListItem['$props'];
};

export type BaseContextMenuProps = {
  type: AvailableComponents;
  children?: BaseContextMenuProps[];
  onClick?: (data?: unknown) => void;
} & (VDividerProps | VListItemProps);

const props = defineProps<{
  elementId: string;
  items: BaseContextMenuProps[];
}>();

const emit = defineEmits(['context-menu:close']);

const toggleComponent = ref<boolean>();
const componentDimension = reactive({
  width: 0,
  height: 0,
});

// Ref: https://github.com/johndatserakis/vue-simple-context-menu/blob/develop/src/vue-simple-context-menu.vue
const data = ref<unknown>();

function showMenu(event: MouseEvent, context?: unknown) {
  toggleComponent.value = true;
  if (context) data.value = context;

  let menu = document.getElementById(props.elementId);
  if (!menu) return;

  if (!componentDimension.width || !componentDimension.height) {
    componentDimension.width = menu.offsetWidth;
    componentDimension.height = menu.offsetHeight;
  }

  const borderSize = 2;
  const navigationWidth = 256;
  // const topBarHeight = 40;

  // TODO: Dynamic Menu Position

  // const isPlaceMenuOnRight =
  //   navigationWidth + componentDimension.width + event.pageX >= window.innerWidth;
  // if (isPlaceMenuOnRight) {
  //   menu.style.left =
  //     event.pageX - componentDimension.width + borderSize + 'px';
  //   menu.style.left =
  //     event.pageX - navigationWidth - componentDimension.width + borderSize + 'px'; // If navigationDrawer included
  // } else {
  //   menu.style.left = event.pageX + borderSize + 'px';
  //   menu.style.left = event.pageX - navigationWidth + borderSize + 'px'; // If navigationDrawer included
  // }

  // const isPlaceMenuOnBottom =
  //   topBarHeight + componentDimension.height + event.pageY >= window.innerHeight;
  // if (isPlaceMenuOnBottom) {
  //   menu.style.top =
  //     event.pageY - componentDimension.height + borderSize + 'px';
  //   menu.style.top =
  //     event.pageY - topBarHeight - componentDimension.height + borderSize + 'px'; // If appBar included
  // } else {
  //   menu.style.top = event.pageY - topBarHeight - borderSize + 'px'; // If appBar included
  //   menu.style.top = event.pageY - borderSize + 'px';
  // }

  menu.style.left = event.pageX - navigationWidth + borderSize + 'px';
  menu.style.top = event.pageY - borderSize + 'px';
}

function hideContextMenu() {
  toggleComponent.value = false;
  const element = document.getElementById(props.elementId);
  if (element) emit('context-menu:close');
}

function onClickOutside() {
  hideContextMenu();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    hideContextMenu();
  }
}

onMounted(() => document.body.addEventListener('keyup', onKeyDown));

onBeforeUnmount(() => document.body.removeEventListener('keyup', onKeyDown));

// TODO: Implement store
defineExpose({ showMenu });
</script>

<template>
  <v-sheet
    :id="elementId"
    border="md"
    class="position-absolute"
    :class="{ 'd-none': !toggleComponent }"
    v-click-outside="{ handler: onClickOutside }"
  >
    <base-context-menu-list :data :items />
  </v-sheet>
</template>
