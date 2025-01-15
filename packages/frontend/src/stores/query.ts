import { useAuthStore } from './auth';
import { useStateStore } from './state';

import { useProjectUsersService } from '@/services/useProjectUsersService';
import { useViewsService } from '@/services/useViewsService';
import { useWorkspacesService } from '@/services/useWorkspacesService';
import { useListsService } from '@/services/useListsService';

import {
  type List,
  type CardType,
  WorkspaceTypes,
  type ListStage,
} from '@tillywork/shared';

export const useQueryStore = defineStore('query', () => {
  const { isAuthenticated } = useAuthStore();
  const { user, project, workspace } = storeToRefs(useAuthStore());
  const { getCurrentList } = useStateStore();

  const { useGetViewsQuery } = useViewsService();
  const { useProjectUsersQuery } = useProjectUsersService();
  const { useGetWorkspacesQuery } = useWorkspacesService();
  const { useGetListsQuery } = useListsService();

  const cardTypes = computed<CardType[]>(
    () => workspace.value?.cardTypes ?? []
  );
  const list = computed<List | undefined>(() => getCurrentList());
  const listStages = computed<ListStage[]>(() => list.value?.listStages ?? []);

  const { data: usersData } = useProjectUsersQuery({
    projectId: project.value?.id as number,
    select: (projectUsers) => projectUsers.map((pU) => pU.user),
    enabled: computed(() => !!project.value),
  });
  const users = computed(() => usersData.value);

  const { data: workspacesData } = useGetWorkspacesQuery({
    enabled: computed(() => !!project.value && isAuthenticated()),
  });
  const workspaces = computed(() => workspacesData.value);

  const { data: listsData } = useGetListsQuery({
    workspaceId: computed(() => workspace.value?.id as number),
    throughSpace: computed(
      () => workspace.value?.type === WorkspaceTypes.PROJECT_MANAGEMENT
    ),
    enabled: computed(() => !!workspace.value),
  });
  const lists = computed(() => listsData.value);

  const { data: viewsData } = useGetViewsQuery({
    listId: computed(() => list.value?.id as number),
    enabled: computed(() => !!list.value),
  });
  const views = computed(() => viewsData.value);

  return {
    user,
    users,
    workspace,
    workspaces,
    cardTypes,
    list,
    lists,
    listStages,
    views,
  };
});
