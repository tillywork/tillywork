export enum DIALOGS {
  CREATE_CARD = 'CreateCardDialog',
  CONFIRM = 'ConfirmDialog',
  ONBOARDING = 'OnboardingDialog',
  SETTINGS = 'SettingsDialog',
  CREATE_SPACE = 'CreateSpaceDialog',
  CREATE_LIST = 'CreateListDialog',
  CREATE_WORKSPACE = 'CreateWorkspaceDialog',
}

export const DIALOG_WIDTHS = {
  [DIALOGS.CREATE_CARD]: 700,
  [DIALOGS.CREATE_SPACE]: 400,
  [DIALOGS.CREATE_LIST]: 400,
  [DIALOGS.CONFIRM]: 500,
  [DIALOGS.ONBOARDING]: 0,
  [DIALOGS.SETTINGS]: 0,
  [DIALOGS.CREATE_WORKSPACE]: 0,
};
