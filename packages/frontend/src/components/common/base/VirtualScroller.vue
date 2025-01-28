<script setup lang="ts">
const { items, itemSize, columns, rowHeight } = defineProps<{
  /** List of items to render */
  items: any[];
  /** Height of each item */
  itemSize: number;
  /** Number of columns in the grid */
  columns: number;
  /** Height of each row (including gap) */
  rowHeight: number;
}>();

const gridContainer = ref<HTMLElement | null>(null);
const scrollTop = ref(0);

const visibleItems = computed(() => {
  if (!gridContainer.value) return [];

  const containerHeight = gridContainer.value.clientHeight;
  const scrollOffset = scrollTop.value;

  const startRow = Math.floor(scrollOffset / rowHeight);
  const endRow = Math.ceil((scrollOffset + containerHeight) / rowHeight);

  const startIndex = startRow * columns;
  const endIndex = endRow * columns;

  return items.slice(startIndex, endIndex);
});

const gridHeight = computed(
  () => `${Math.ceil(items.length / columns) * rowHeight}px`
);

const handleScroll = () => {
  if (!gridContainer.value) return;
  scrollTop.value = gridContainer.value.scrollTop;
};

const getItemTop = (item: any) => {
  const index = items.indexOf(item);
  return `${Math.floor(index / columns) * rowHeight}px`;
};

const getItemLeft = (item: any) => {
  const index = items.indexOf(item);
  return `${(index % columns) * (100 / columns)}%`;
};

watch(
  () => items,
  () => {
    nextTick(() => {
      if (gridContainer.value) {
        gridContainer.value.addEventListener('scroll', handleScroll);
        handleScroll();
      }
    });
  },
  { immediate: true }
);

onUnmounted(() => {
  if (gridContainer.value) {
    gridContainer.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <div
    ref="gridContainer"
    class="virtual-grid-container"
    :style="{ height: '100%', overflow: 'auto' }"
  >
    <div
      class="virtual-grid"
      :style="{
        height: gridHeight,
        position: 'relative',
      }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.icon"
        class="virtual-grid-item"
        :style="{
          top: getItemTop(item),
          left: getItemLeft(item),
          width: `${100 / columns}%`,
          height: `${itemSize}px`,
        }"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-grid-container {
  overflow: auto;

  .virtual-grid {
    position: relative;

    .virtual-grid-item {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
