import type { Field, CreateFieldDto } from '@/components/common/fields/types';
import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRef } from 'vue';

export type GetFieldsParams = {
  workspaceId?: MaybeRef<number>;
  listId?: MaybeRef<number>;
};

export const useFieldsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getFields({
    workspaceId,
    listId,
  }: GetFieldsParams): Promise<Field[]> {
    return sendRequest('/fields', {
      method: 'GET',
      params: {
        workspaceId: toValue(workspaceId),
        listId: toValue(listId),
      },
    });
  }

  function useFieldsQuery(params: GetFieldsParams) {
    return useQuery({
      queryKey: ['fields'],
      queryFn: () => getFields(params),
      refetchOnWindowFocus: false,
    });
  }

  function updateField(field: Partial<Field>) {
    return sendRequest(`/fields/${field.id}`, {
      method: 'PUT',
      data: field,
    });
  }

  function updateFieldMutation() {
    return useMutation({
      mutationFn: updateField,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fields'] }),
    });
  }

  function createField(fieldDto: CreateFieldDto) {
    return sendRequest('/fields', {
      method: 'POST',
      data: fieldDto,
    });
  }

  function createFieldMutation() {
    return useMutation({
      mutationFn: createField,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fields'] }),
    });
  }

  function deleteField(fieldId: number) {
    return sendRequest(`/fields/${fieldId}`, {
      method: 'DELETE',
    });
  }

  function deleteFieldMutation() {
    return useMutation({
      mutationFn: deleteField,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fields'] });
      },
    });
  }

  return {
    useFieldsQuery,
    updateFieldMutation,
    createFieldMutation,
    deleteFieldMutation,
  };
};
