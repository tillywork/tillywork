import { useAccessControlService } from '@/services/useAccessControlService';

import {
  PERMISSION_LEVEL_ORDER,
  PermissionLevel,
  type AccessControl,
} from '@tillywork/shared';

export const useAccessControlStore = defineStore(
  'permissions',
  () => {
    const { useGetUserPermissions } = useAccessControlService();
    const { data: permissions } = useGetUserPermissions();

    const permissionsMap = computed(() => {
      const map: Record<string, Record<number, AccessControl>> = {
        project: {},
        workspace: {},
        space: {},
        list: {},
      };

      if (permissions.value) {
        permissions.value.forEach((perm: AccessControl) => {
          if (perm.project) map.project[perm.project.id] = perm;
          if (perm.workspace) map.workspace[perm.workspace.id] = perm;
          if (perm.space) map.space[perm.space.id] = perm;
          if (perm.list) map.list[perm.list.id] = perm;
        });
      }

      return map;
    });

    function getPermissionLevel(
      type: 'project' | 'workspace' | 'space' | 'list',
      id: number
    ): PermissionLevel | null {
      return permissionsMap.value[type]?.[id]?.permissionLevel ?? null;
    }

    function hasPermission(
      type: 'project' | 'workspace' | 'space' | 'list',
      id: number,
      requiredLevel: PermissionLevel
    ): boolean {
      const current = getPermissionLevel(type, id);
      if (!current) return false;

      return (
        PERMISSION_LEVEL_ORDER.indexOf(current) >=
        PERMISSION_LEVEL_ORDER.indexOf(requiredLevel)
      );
    }

    function isProjectOwner(id: number) {
      return getPermissionLevel('project', id) === PermissionLevel.OWNER;
    }

    function isProjectEditor(id: number) {
      return hasPermission('project', id, PermissionLevel.EDITOR);
    }

    function isWorkspaceEditor(id: number) {
      return hasPermission('workspace', id, PermissionLevel.EDITOR);
    }

    return {
      getPermissionLevel,
      hasPermission,
      isProjectOwner,
      isProjectEditor,
      isWorkspaceEditor,
    };
  },
  {
    persist: true,
  }
);
