import type {
  RouteLocationNormalized,
  NavigationGuardNext,
} from 'vue-router/auto';
import { useAuthStore } from '@/stores/auth';
import {
  projectUserActivityEntityTypes,
  type CreateProjectUserActivityDTO,
} from '@/components/common/projects/types';
import { useProjectUserActivityService } from '@/composables/services/useProjectUserActivityService';

// Ref: https://fettblog.eu/typescript-array-includes/#option-2%3A-a-helper-with-type-assertions
function includes<T extends U, U>(arr: ReadonlyArray<T>, item: U): item is T {
  return arr.includes(item as T);
}

export const collectActivities = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((record) => record.meta.collectActivities)) {
    const { workspace, project, user } = useAuthStore();
    const { fullPath, params } = to;

    if (project && user && workspace) {
      const entityType = fullPath.split('/')[2].toUpperCase();
      if (includes(projectUserActivityEntityTypes, entityType)) {
        const idKey = `${entityType.toLowerCase()}Id`;
        const activity: CreateProjectUserActivityDTO = {
          workspaceId: workspace.id,
          type: 'VIEW',
          entityType,
          entityId: (params as Record<string, number>)[idKey],
        };

        const { useCreateProjectUserActivityMutation } =
          useProjectUserActivityService();
        const { mutateAsync: createProjectUserActivity } =
          useCreateProjectUserActivityMutation();

        createProjectUserActivity({
          projectId: project.id,
          userId: user.id,
          activity,
        });
      }
    }
  }
  next();
};
