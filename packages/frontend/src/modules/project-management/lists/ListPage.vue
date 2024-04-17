<script setup lang="ts">
import { ref } from 'vue';
import { ListsService } from './lists.service';
import { useRoute } from 'vue-router';
import type { List } from './types';
import { watch } from 'vue';

const listsService = new ListsService;
const route = useRoute();
const list = ref<List>();

async function getList() {
    list.value = await listsService.getList(+route.params.listId);
    document.title = `${list.value.name} | FalconDrive`;
}

watch(() => route.params.listId, () => {
    getList();
}, { immediate: true })
</script>

<template>
	{{ list }}
</template>