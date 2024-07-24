import { SETTINGS } from '@/components/common/settings/types';

export const useSettings = () => {
  const settings = {
    [SETTINGS.THEME]: {
      icon: 'mdi-monitor-screenshot',
      component: defineAsyncComponent(
        () => import('../components/common/settings/ThemeSettings.vue')
      ),
    },
    [SETTINGS.WORKSPACE]: {
      icon: 'mdi-briefcase-outline',
      component: defineAsyncComponent(
        () => import('../components/common/settings/WorkspaceSettings.vue')
      ),
    },
    [SETTINGS.CARD_TYPES]: {
      icon: 'mdi-toy-brick-outline',
      component: defineAsyncComponent(
        () => import('../components/common/settings/CardTypesSettings.vue')
      ),
    },
    [SETTINGS.CUSTOM_FIELDS]: {
      icon: 'mdi-form-select',
      component: defineAsyncComponent(
        () => import('../components/common/settings/CustomFieldsSettings.vue')
      ),
    },
    [SETTINGS.PROJECT_MEMBERS]: {
      icon: 'mdi-account-multiple-outline',
      component: defineAsyncComponent(
        () => import('../components/common/settings/ProjectMembersSettings.vue')
      ),
    },
  };

  return {
    sections: Object.keys(settings),
    settings,
  };
};
