import { useHttp } from '@/composables/useHttp';
import type { Card } from '@/components/project-management/cards/types';
import type { QueryFilter } from '@/components/project-management/views/TableView/types';

export interface CardsData {
  cards: Card[];
  total: number;
}

export const useCardsService = () => {
  async function getCards({
    listId,
    page = 1,
    limit = 10,
    sortBy = [
      {
        key: 'createdAt',
        order: 'desc',
      },
    ],
    filters,
  }: {
    listId: number;
    page: number;
    limit: number;
    sortBy?: {
      key: string;
      order: string;
    }[];
    filters?: QueryFilter;
  }): Promise<CardsData> {
    const { sendRequest } = useHttp();

    console.log({ listId, page, limit, sortBy, filters });

    return sendRequest('/cards', {
      method: 'GET',
      params: {
        listId,
        page,
        limit,
        sortBy: sortBy[0]?.key,
        sortOrder: sortBy[0]?.order,
        filters: JSON.stringify(filters),
      },
    });
  }

  async function createCard(card: Partial<Card>): Promise<Card> {
    const { sendRequest } = useHttp();

    return sendRequest('/cards', {
      method: 'POST',
      data: card,
    });
  }

  async function getCard(cardId: number): Promise<Card> {
    const { sendRequest } = useHttp();

    return sendRequest(`/cards/${cardId}`, {
      method: 'GET',
    });
  }

  async function updateCard(card: Card): Promise<Card> {
    const { sendRequest } = useHttp();

    return sendRequest(`/cards/${card.id}`, {
      method: 'PUT',
      data: card,
    });
  }

  async function deleteCard(cardId: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async function updateCardListStage({
    cardListId,
    listStageId,
  }: {
    cardListId: number;
    listStageId: number;
  }) {
    const { sendRequest } = useHttp();

    return sendRequest(`/cards/lists/${cardListId}`, {
      method: 'PUT',
      data: {
        listStageId,
      },
    });
  }

  return {
    getCards,
    createCard,
    getCard,
    updateCard,
    deleteCard,
    updateCardListStage,
  };
};
