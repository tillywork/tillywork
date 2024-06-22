export enum DIALOGS {
  CREATE_CARD = 'CreateCardDialog',
  CONFIRM = 'ConfirmDialog',
  ONBOARDING = 'OnboardingDialog',
  SETTINGS = 'SettingsDialog',
  CREATE_SPACE = 'CreateSpaceDialog',
  CREATE_LIST = 'CreateListDialog',
  CREATE_WORKSPACE = 'CreateWorkspaceDialog',
  CREATE_VIEW = 'CreateViewDialog',
  CREATE_CARD_TYPE = 'CreateCardType',
  REMOVE_CARD_TYPE = 'RemoveCardType',
  UPSERT_LIST_STAGE = 'UpsertListStage',
  REMOVE_LIST_STAGE = 'RemoveListStage',
  EDIT_LIST_STAGES = 'EditListStages',
}

export const DIALOG_WIDTHS = {
  [DIALOGS.CREATE_CARD]: 700,
  [DIALOGS.CREATE_SPACE]: 400,
  [DIALOGS.CREATE_LIST]: 400,
  [DIALOGS.CREATE_VIEW]: 400,
  [DIALOGS.CONFIRM]: 500,
  [DIALOGS.ONBOARDING]: undefined,
  [DIALOGS.SETTINGS]: undefined,
  [DIALOGS.CREATE_WORKSPACE]: undefined,
  [DIALOGS.CREATE_CARD_TYPE]: 400,
  [DIALOGS.REMOVE_CARD_TYPE]: 500,
  [DIALOGS.UPSERT_LIST_STAGE]: 400,
  [DIALOGS.REMOVE_LIST_STAGE]: 500,
  [DIALOGS.EDIT_LIST_STAGES]: 400,
};

export type SettingsTab = {
  icon: string;
  text: string;
  value: SettingsTabs;
};

export enum SettingsTabs {
  THEME = 'theme',
  CARD_TYPES = 'cardTypes',
  FIELDS = 'fields',
}
