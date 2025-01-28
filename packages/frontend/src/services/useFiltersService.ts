import { useMutation } from '@tanstack/vue-query';
import { useHttp } from '@/composables/useHttp';
import type { CreateFilterDto, Filter } from '@tillywork/shared';

export const useFitlersService = () => {
  const { sendRequest } = useHttp();

  function createFilter(createFilterDto: CreateFilterDto) {
    return sendRequest('/filters', {
      method: 'POST',
      data: createFilterDto,
    });
  }

  function useCreateFilterMutation() {
    return useMutation({
      mutationFn: createFilter,
    });
  }

  function updateFilter({
    id,
    updateFilterDto,
  }: {
    id: number;
    updateFilterDto: Partial<Filter>;
  }) {
    return sendRequest(`/filters/${id}`, {
      method: 'PUT',
      data: updateFilterDto,
    });
  }

  function useUpdateFilterMutation() {
    return useMutation({
      mutationFn: updateFilter,
    });
  }

  return {
    useCreateFilterMutation,
    useUpdateFilterMutation,
  };
};
