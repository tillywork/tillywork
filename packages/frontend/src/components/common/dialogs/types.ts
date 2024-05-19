export enum DIALOGS {
  CREATE_CARD = 'CreateCardDialog',
  CONFIRM = 'ConfirmDialog',
  ONBOARDING = 'OnboardingDialog',
  SETTINGS = 'SettingsDialog',
}

export const DIALOG_WIDTHS = {
  [DIALOGS.CREATE_CARD]: 700,
  [DIALOGS.CONFIRM]: 500,
  [DIALOGS.ONBOARDING]: 0,
  [DIALOGS.SETTINGS]: 0,
};
