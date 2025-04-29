import { SettingsType } from '@/components/common/settings/types';

export type SettingsNavigationItem = {
  icon: string;
  component: any;
  title: string;
  type: SettingsType;
};

export const useSettings = () => {
  const themeSettings: SettingsNavigationItem[] = [
    {
      icon: 'mdi-monitor-screenshot',
      component: defineAsyncComponent(
        () => import('../components/common/settings/ThemeSettings.vue')
      ),
      title: 'Theme',
      type: SettingsType.THEME,
    },
  ];

  const accountSettings: SettingsNavigationItem[] = [
    {
      icon: 'mdi-bell',
      component: defineAsyncComponent(
        () => import('../components/common/settings/NotificationSettings.vue')
      ),
      title: 'Notifications',
      type: SettingsType.NOTIFICATIONS,
    },
  ];

  const workspaceSettings: SettingsNavigationItem[] = [
    {
      icon: 'mdi-briefcase-outline',
      component: defineAsyncComponent(
        () => import('../components/common/settings/WorkspaceSettings.vue')
      ),
      title: 'Workspace',
      type: SettingsType.WORKSPACE,
    },
    {
      icon: 'mdi-tools',
      component: defineAsyncComponent(
        () => import('../components/common/settings/IntegrationSettings.vue')
      ),
      title: 'Integrations',
      type: SettingsType.INTEGRATIONS,
    },
    {
      icon: 'mdi-account-multiple-outline',
      component: defineAsyncComponent(
        () => import('../components/common/settings/ProjectMembersSettings.vue')
      ),
      title: 'Invite members',
      type: SettingsType.PROJECT_MEMBERS,
    },
  ];

  const cardSettings: SettingsNavigationItem[] = [
    {
      icon: 'mdi-toy-brick-outline',
      component: defineAsyncComponent(
        () => import('../components/common/settings/CardTypesSettings.vue')
      ),
      title: 'Card types',
      type: SettingsType.CARD_TYPES,
    },
    {
      icon: 'mdi-form-select',
      component: defineAsyncComponent(
        () => import('../components/common/settings/CustomFieldsSettings.vue')
      ),
      title: 'List fields',
      type: SettingsType.CUSTOM_FIELDS,
    },
  ];

  const allSettings: SettingsNavigationItem[] = [
    ...themeSettings,
    ...accountSettings,
    ...workspaceSettings,
    ...cardSettings,
  ];

  return {
    allSettings,
    themeSettings,
    accountSettings,
    workspaceSettings,
    cardSettings,
  };
};
