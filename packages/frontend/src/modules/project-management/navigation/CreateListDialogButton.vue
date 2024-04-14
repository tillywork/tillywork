<script setup lang="ts">
const createListDialog = defineModel<boolean>();
const emit = defineEmits(['click']);

function handleCreateListDialogClick() {
	createListDialog.value = true;
	emit('click');
}
</script>

<template>
	<v-btn id="create-list-button" color="default" density="compact" icon="mdi-plus" rounded="circle" size="small"
		@click="handleCreateListDialogClick" @click.stop />
	<v-tooltip activator="#create-list-button" location="bottom"><span class="text-caption">Add list to
			this space</span></v-tooltip>
</template>