import { normalizeKeyCombo } from '@/utils/keys';

export function useKeyboardShortcuts() {
  const { current } = useMagicKeys();

  const activeKeys = computed(() => {
    return normalizeKeyCombo(Array.from(current));
  });

  const currentKeyCombo = computed(() => {
    return activeKeys.value.join('+');
  });

  return {
    activeKeys,
    currentKeyCombo,
  };
}
