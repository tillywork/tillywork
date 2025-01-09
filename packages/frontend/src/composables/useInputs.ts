import type { FieldItem } from '@tillywork/shared';
import { isEqual } from 'lodash';

export interface UseInputsProps {
  modelValue?: string[];
  items?: FieldItem[];
  placeholder?: string;
  multiple?: boolean;
  icon?: string;
  textField?: boolean;
  variant?:
    | 'outlined'
    | 'plain'
    | 'underlined'
    | 'filled'
    | 'solo'
    | 'solo-inverted'
    | 'solo-filled';
  rounded?: string;
  density?: 'compact' | 'comfortable' | 'default';
  fill?: boolean;
  label?: string;
  mandatory?: boolean;
}

interface UseInputsEmit {
  (e: 'update:modelValue', value: string[]): void;
}

export function useInputs(props: UseInputsProps, emit: UseInputsEmit) {
  const selected: Ref<string[]> = ref(props.modelValue || []);
  const search: Ref<string> = ref('');

  const selectedItems = computed(() =>
    selected.value
      .map((label) => props.items?.find((item) => item.item === label))
      .filter((item): item is FieldItem => item !== undefined)
  );

  const filteredItems = computed(() => {
    if (search.value) {
      return props.items?.filter((item) =>
        item.item.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())
      );
    }
    return props.items;
  });

  function isItemSelected(item: FieldItem): boolean {
    return selected.value.includes(item.item);
  }

  function toggleItemSelection(item: FieldItem): void {
    let newSelected: string[];
    if (props.multiple) {
      newSelected = isItemSelected(item)
        ? selected.value.filter((label) => label !== item.item)
        : [...selected.value, item.item];
    } else {
      newSelected = isItemSelected(item) ? [] : [item.item];
    }

    if (props.mandatory && newSelected.length === 0) {
      /** If mandatory is true and selection would become empty,
       * revert to the current selection or do nothing
       */
      return;
    }
    selected.value = newSelected;
  }

  watch(selected, (v) => {
    if (!isEqual(v, props.modelValue)) {
      emit('update:modelValue', v);
    }
  });

  return {
    selected,
    selectedItems,
    search,
    filteredItems,
    isItemSelected,
    toggleItemSelection,
  };
}
