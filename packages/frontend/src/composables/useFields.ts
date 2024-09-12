import { toValue, type MaybeRef } from 'vue';
import { useFieldsService } from '@/services/useFieldsService';
import { FieldTypes, type Field } from '@tillywork/shared';

export const useFields = ({
  cardTypeId,
  listId,
  enabled,
}: {
  cardTypeId: MaybeRef<number>;
  listId?: MaybeRef<number>;
  enabled?: MaybeRef<boolean>;
}) => {
  const { useFieldsQuery } = useFieldsService();

  const cardTypeFieldsEnabled = computed(
    () => !!cardTypeId && (toValue(enabled) ?? true)
  );
  const listFieldsEnabled = computed(
    () => !!listId && (toValue(enabled) ?? true)
  );

  const { data: cardTypeFields, refetch } = useFieldsQuery({
    cardTypeId,
    enabled: cardTypeFieldsEnabled,
  });

  const { data: listFields } = useFieldsQuery({
    listId,
    enabled: listFieldsEnabled,
  });

  const fields = computed<Field[]>(() => {
    let arr: Field[] = [];

    if (cardTypeFields.value && cardTypeFieldsWithoutMainFields.value) {
      arr = [...arr, ...cardTypeFieldsWithoutMainFields.value];
    }

    if (listFields.value) {
      arr = [...arr, ...listFields.value];
    }

    return arr;
  });

  const titleField = computed(() =>
    cardTypeFields.value?.find((field) => field.isTitle)
  );

  const descriptionField = computed(() =>
    cardTypeFields.value?.find((field) => field.isDescription)
  );

  const cardTypeFieldsWithoutMainFields = computed(() =>
    cardTypeFields.value?.filter(
      (field) => !field.isTitle && !field.isDescription && !field.isPhoto
    )
  );

  const pinnedFields = computed(() =>
    fields.value?.filter((field) => field.isPinned)
  );

  const groupableFields = computed(() =>
    fields.value?.filter((field) =>
      [
        FieldTypes.DROPDOWN,
        FieldTypes.LABEL,
        FieldTypes.DATE,
        FieldTypes.USER,
      ].includes(field.type)
    )
  );

  const tableFields = computed(() =>
    fields.value.filter((field) =>
      [
        FieldTypes.DROPDOWN,
        FieldTypes.CARD,
        FieldTypes.LABEL,
        FieldTypes.DATE,
        FieldTypes.USER,
      ].includes(field.type)
    )
  );

  return {
    fields,
    listFields,
    cardTypeFields,
    titleField,
    descriptionField,
    cardTypeFieldsWithoutMainFields,
    pinnedFields,
    groupableFields,
    tableFields,
    refetch,
  };
};
