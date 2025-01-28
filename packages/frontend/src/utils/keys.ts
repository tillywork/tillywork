export const leaderKey = navigator.userAgent.includes('Mac OS')
  ? 'Cmd'
  : 'Ctrl';
export const alternateKey = navigator.userAgent.includes('Mac OS')
  ? 'Alt'
  : 'Alt';

type KeyMap = {
  [key: string]: string;
};

const KEY_NORMALIZE_MAP: KeyMap = {
  CONTROL: 'CTRL',
  META: 'CMD',
  ESCAPE: 'ESC',
  ARROWUP: 'UP',
  ARROWDOWN: 'DOWN',
  ARROWLEFT: 'LEFT',
  ARROWRIGHT: 'RIGHT',
  RETURN: 'ENTER',
  SPACE: 'SPACEBAR',
  DELETE: 'DEL',
};

export function normalizeKey(key: string): string {
  const upperKey = key.toUpperCase();
  return KEY_NORMALIZE_MAP[upperKey] || upperKey;
}

export function normalizeKeyCombo(keys: string[]): string[] {
  return keys.map(normalizeKey);
}
