import type { MaybeRef } from 'vue';
import { useFieldsService } from '@/services/useFieldsService';

export const useCardTypeFields = ({
  cardTypeId,
}: {
  cardTypeId: MaybeRef<number>;
}) => {
  const { useFieldsQuery } = useFieldsService();
  const { data: cardTypeFields, refetch } = useFieldsQuery({
    cardTypeId,
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

  return {
    cardTypeFields,
    titleField,
    descriptionField,
    cardTypeFieldsWithoutMainFields,
    refetch,
  };
};
