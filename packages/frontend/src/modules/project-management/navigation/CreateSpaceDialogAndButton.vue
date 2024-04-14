<script setup lang="ts">
import { ref } from 'vue';
import { SpacesService } from '../spaces/spaces.service';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import { validation } from '@/utils/validation';
import { VForm } from 'vuetify/lib/components/index.mjs';

const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);

const spacesService = new SpacesService();
const createSpaceDialog = ref(false);
const createSpaceForm = ref<null | VForm>(null);
const createSpaceLoading = ref(false);
const createSpaceData = ref({
	name: '',
	workspaceId: selectedWorkspace.value?.id,
});

const emit = defineEmits(['create'])

function closeCreateSpaceDialog() {
	createSpaceDialog.value = false;
}

async function createSpace() {
	if (!createSpaceForm.value?.isValid) return;

	createSpaceLoading.value = true;
	createSpaceData.value.workspaceId = selectedWorkspace.value?.id;
	const space = await spacesService.createSpace(createSpaceData.value);

	emit('create', space);
	createSpaceLoading.value = false;
	createSpaceForm.value.reset();
	closeCreateSpaceDialog();
}
</script>

<template>
	<v-btn id="create-space-button" density="compact" icon="mdi-plus" rounded="circle" size="small" />
	<v-tooltip activator="#create-space-button" location="bottom"><span class="text-caption">Create
			Space</span></v-tooltip>

	<v-dialog v-model="createSpaceDialog" activator="#create-space-button" width="400">
		<template v-slot:default>
			<v-form ref="createSpaceForm" @submit.prevent="createSpace">
				<v-card :loading="createSpaceLoading">
					<template v-slot:loader="{ isActive }">
						<v-progress-linear :active="isActive" color="primary" height="4"
							indeterminate></v-progress-linear>
					</template>
					<v-card-title class="text-body-2 font-weight-medium">Create Space</v-card-title>
					<v-divider />
					<v-card-text>
						<v-text-field v-model="createSpaceData.name" prepend-inner-icon="mdi-file-cabinet" single-line
							label="Space Name" :rules="[validation.rules.required]" />
					</v-card-text>
					<v-divider />
					<v-card-actions>
						<v-spacer />
						<v-btn color="default" @click="closeCreateSpaceDialog()"
							:disabled="createSpaceLoading" rounded="xl" class="text-capitalize">Cancel</v-btn>
						<v-btn variant="flat" :disabled="createSpaceLoading" type="submit" rounded="xl" class="text-capitalize">Create</v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</template>
	</v-dialog>
</template>
