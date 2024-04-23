import { useHttp } from '@/composables/useHttp';

export interface GetContactNotesParams {
  contactId: number;
  page: number;
  itemsPerPage: number;
  sortBy: {
    key: string;
    order: string;
  }[];
}

export interface Note {
  id: number;
  note: string;
  entityType: 'contact' | 'organization';
  entityId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  otherEmails?: string[];
  projectId: number;
}

export interface NotesData {
  notes: Note[];
  total: number;
}

export const useNotesService = () => {
  async function create(note: {
    note: string;
    entityId: number;
    entityType: 'contact' | 'organization';
  }): Promise<any> {
    const { sendRequest } = useHttp();

    return sendRequest(`/notes`, {
      method: 'POST',
      data: note,
    });
  }

  async function getContactNotes({
    contactId,
    page,
    itemsPerPage,
    sortBy,
  }: GetContactNotesParams): Promise<NotesData> {
    const { sendRequest } = useHttp();

    return sendRequest(`/notes/contacts/${contactId}`, {
      method: 'GET',
      params: {
        page,
        limit: itemsPerPage,
        sortBy: sortBy[0]?.key,
        sortOrder: sortBy[0]?.order,
      },
    });
  }

  return {
    create,
    getContactNotes,
  };
};
