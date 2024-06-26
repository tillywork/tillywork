import type { Field, CreateFieldDto } from '@/components/common/fields/types';
import { useHttp } from '@/composables/useHttp';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

export const useFieldsService = () => {
  const { sendRequest } = useHttp();
  const queryClient = useQueryClient();

  async function getFields({
    workspaceId,
  }: {
    workspaceId: number;
  }): Promise<Field[]> {
    return sendRequest('/fields', {
      method: 'GET',
      params: {
        workspaceId,
      },
    });
  }

  function useFieldsQuery({ workspaceId }: { workspaceId: number }) {
    return useQuery({
      queryKey: ['fields'],
      queryFn: () => getFields({ workspaceId }),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
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

  return {
    useFieldsQuery,
    updateFieldMutation,
    createFieldMutation,
  };
};
