import type { MaybeRef } from 'vue';
import { useFieldsService } from '@/services/useFieldsService';

export const useCardTypeFields = ({
  cardTypeId,
  enabled,
}: {
  cardTypeId: MaybeRef<number>;
  enabled?: MaybeRef<boolean>;
}) => {
  const { useFieldsQuery } = useFieldsService();
  const { data: cardTypeFields, refetch } = useFieldsQuery({
    cardTypeId,
    enabled,
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
    cardTypeFieldsWithoutMainFields.value?.filter((field) => field.isPinned)
  );

  return {
    cardTypeFields,
    titleField,
    descriptionField,
    cardTypeFieldsWithoutMainFields,
    pinnedFields,
    refetch,
  };
};
