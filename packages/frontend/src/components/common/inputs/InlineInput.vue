<script setup lang="ts">
import { ref } from 'vue';
import { InlineInputTypes } from './types';
import { onMounted } from 'vue';

const modelValue = defineModel<any>();
const props = defineProps<{
  name: string
  label: string
  type: InlineInputTypes
}>();
const emit = defineEmits(['update:modelValue', 'submit:input', 'clear:input'])
const isEditing = ref<string | undefined>();

function handlePropertyClick(key: string) {
  if (isEditing.value !== key) {
    isEditing.value = key;

    if (props.type === InlineInputTypes.ARRAY) {
      if (!modelValue.value[0]) {
        modelValue.value = [''];
      }
    }
  }
}

async function handleUpdateProperty() {
  emit('submit:input');
}

function handleClearProperty() {
  isEditing.value = undefined;
  emit('clear:input');
}

onMounted(() => {
})

// TODO prepend icons to text field
</script>

<template>
  <!-- <template v-if="isEditing !== props.name">
    <table>
      <tr>
        <td width="100px" height="36px">
          <span class="text-caption">{{ props.label }}</span>
        </td>
        <td>
          <span @click="handlePropertyClick(props.name)"
            class="ml-4 text-decoration-underline cursor-pointer text-info text-truncate">
            {{ modelValue }}
          </span>
        </td>
      </tr>
    </table>
  </template>
<template v-else>
    <v-text-field v-model="modelValue" :label="props.label" variant="outlined" hide-details
      append-icon="mdi-send-circle-outline" @click:append="handleUpdateProperty" clearable
      @click:clear="handleClearProperty" class="mt-1" v-click-outside="handleClearProperty"></v-text-field>
  </template> -->
  <div class="inline-input-wrapper px-4 h-40px">
    <template v-if="isEditing !== props.name">
      <div class="d-flex align-center">
        <span class="w-95px text-caption mr-4">{{ props.label }}</span>
        <template v-if="props.type === InlineInputTypes.TEXT">
          <span @click="handlePropertyClick(props.name)"
            class="w-100-95px ml-4 text-decoration-underline cursor-pointer text-info text-truncate">
            {{ modelValue ? modelValue : 'No Value' }}
          </span>
        </template>
        <template v-else-if="props.type === InlineInputTypes.ARRAY">
          <span @click="handlePropertyClick(props.name)"
            class="w-100-95px ml-4 text-decoration-underline cursor-pointer text-info text-truncate">
            {{ modelValue && modelValue[0] ? modelValue[0] : 'No Value' }}
          </span>
        </template>
      </div>
    </template>
    <template v-else>
      <template v-if="props.type === InlineInputTypes.TEXT">
        <div>
          <v-text-field v-model="modelValue" :label="props.label" variant="outlined" hide-details
            append-icon="mdi-send-circle-outline" @click:append="handleUpdateProperty"
            v-click-outside="handleClearProperty">
            <template v-slot:append-inner>
              <v-btn @click="handleClearProperty" variant="text" color="default" icon="mdi-close-circle"
                density="compact">
              </v-btn>
            </template>
          </v-text-field>
        </div>
      </template>
      <templage v-else-if="props.type === InlineInputTypes.ARRAY">
        <template v-for="(item, index) in modelValue" :key="index">
          <div>
            <v-text-field v-model="modelValue[index]" :label="props.label" variant="outlined" hide-details
              append-icon="mdi-send-circle-outline" @click:append="handleUpdateProperty"
              @click:clear="handleClearProperty" v-click-outside="handleClearProperty">
              <template v-slot:append-inner>
                <v-btn @click="handleClearProperty" variant="text" color="default" icon="mdi-close-circle"
                  density="compact">
                </v-btn>
              </template>
            </v-text-field>
          </div>
        </template>
      </templage>
    </template>
  </div>
</template>

<style scoped lang="scss">
.inline-input-wrapper {
  .inline-input-label {
    width: 95px;
  }
}
</style>