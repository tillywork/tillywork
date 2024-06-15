export type SettingTab = {
  icon: string;
  text: string;
  value: SettingTabValues[number];
};

export type SettingTabValues = ['theme', 'cardTypes', 'listStages'];
