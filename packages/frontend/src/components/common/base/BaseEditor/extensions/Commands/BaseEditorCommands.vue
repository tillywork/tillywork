<script lang="ts">
import type { VList } from 'vuetify/components';

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

  mounted() {
    this.$nextTick(() => {
      this.ensureVisible();
    });
  },

  watch: {
    items() {
      this.selectedIndex = 0;
    },
    selectedIndex() {
      this.ensureVisible();
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

    ensureVisible() {
      this.$nextTick(() => {
        const list = this.$refs.suggestionsList as VList;
        if (list.$el) {
          const selectedItem = list.$el.querySelector(
            `.item:nth-child(${this.selectedIndex + 1})`
          );

          const scrollOption = {
            behavior: 'smooth',
            block: 'nearest',
          };

          if (selectedItem) {
            selectedItem.scrollIntoView(scrollOption);
          }
        }
      });
    },
  },
};
</script>

<template>
  <v-card
    class="items border-thin overflow-scroll"
    width="230"
    max-height="305"
  >
    <v-list class="pb-1" ref="suggestionsList">
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
            <v-list-item-title class="text-caption">
              {{ item.title }}
            </v-list-item-title>
            <template #append v-if="item.shortcut">
              <v-code class="text-xs">{{ item.shortcut }}</v-code>
            </template>
          </v-list-item>
        </template>
      </template>
      <v-list-item class="item" v-else>No result</v-list-item>
    </v-list>
  </v-card>
</template>

<style lang="scss">
.v-list-item__prepend > .v-icon ~ .v-list-item__spacer {
  width: 10px !important;
}
.v-list-item {
  scroll-margin-top: 8px;
  scroll-margin-bottom: 8px;
}
</style>
