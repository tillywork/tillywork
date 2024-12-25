<script setup lang="ts">
import { useInputs, type UseInputsProps } from '@/composables/useInputs';
import { useUsers } from '@/composables/useUsers';

const props = defineProps<UseInputsProps>();

const attrs = useAttrs();
const emit = defineEmits();
const { users } = useUsers();
const { isItemSelected, toggleItemSelection, selected } = useInputs(
  props,
  emit
);

function getUser(id: number) {
  return users.value?.find((user) => user.id === id);
}
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-chip
        v-bind="{
          ...props,
          ...attrs,
        }"
        variant="tonal"
        rounded="pill"
        class="text-caption"
        color="primary"
        density="comfortable"
      >
        <template #prepend>
          <v-icon icon="mdi-account" start />
        </template>
        <template v-if="!selected.length"> Assignee </template>
        <template v-else>
          <template v-if="selected.length === 1">
            {{ getUser(selected[0])?.firstName }}
          </template>
          <template v-else> Assignee ({{ selected.length }}) </template>
        </template>
      </v-chip>
    </template>
    <v-card>
      <v-list>
        <template v-for="user in users" :key="user.id">
          <v-list-item
            @click="
              toggleItemSelection({
                item: user.id,
              })
            "
          >
            <template #prepend>
              <base-avatar
                :photo="user.photo"
                :text="`${user.firstName} ${user.lastName}`"
                start
              />
            </template>
            <v-list-item-title>
              {{ user.firstName }} {{ user.lastName }}
            </v-list-item-title>
            <template #append>
              <v-icon
                v-if="
                  isItemSelected({
                    item: user.id,
                  })
                "
                icon="mdi-check"
                size="12"
                end
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
