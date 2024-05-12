<script lang="ts">
export default {
  props: {
    items: {
      type: Array<any>,
      required: true,
    },

    command: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      selectedIndex: 0,
    };
  },

  watch: {
    items() {
      this.selectedIndex = 0;
    },
  },

  methods: {
    onKeyDown({ event }: { event: KeyboardEvent }) {
      if (event.key === 'ArrowUp') {
        this.upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        this.downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        this.enterHandler();
        return true;
      }

      return false;
    },

    upHandler() {
      this.selectedIndex =
        (this.selectedIndex + this.items.length - 1) % this.items.length;
    },

    downHandler() {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    },

    enterHandler() {
      this.selectItem(this.selectedIndex);
    },

    selectItem(index: number) {
      const item = this.items[index];

      if (item) {
        this.command(item);
      }
    },
  },
};
</script>

<template>
  <v-card color="surface" class="items border-thin" width="200">
    <v-list
      class="bg-transparent text-body-2 pb-1"
      nav
      :lines="false"
      density="compact"
    >
      <template v-if="items.length">
        <template v-for="(item, index) in items" :key="'item-' + index">
          <v-list-item
            class="item"
            :active="index === selectedIndex"
            @click="selectItem(index)"
          >
            <template #prepend>
              <v-icon size="14" :icon="item.icon" />
            </template>
            <v-list-iteme-title>{{ item.title }}</v-list-iteme-title>
          </v-list-item>
        </template>
      </template>
      <v-list-item class="item" v-else>No result</v-list-item>
    </v-list>
  </v-card>
</template>

<style lang="scss">
.v-list-item__prepend > .v-icon ~ .v-list-item__spacer {
  width: 10px;
}
</style>
