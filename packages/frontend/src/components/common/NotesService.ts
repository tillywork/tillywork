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

export class NotesService {
  async create(note: {
    note: string;
    entityId: number;
    entityType: 'contact' | 'organization';
  }): Promise<any> {
    const { data, sendRequest } = useHttp();

    await sendRequest(`/notes`, {
      method: 'POST',
      data: note,
    });

    return data;
  }

  async getContactNotes({
    contactId,
    page,
    itemsPerPage,
    sortBy,
  }: GetContactNotesParams): Promise<NotesData> {
    const { data, sendRequest } = useHttp();

    await sendRequest(`/notes/contacts/${contactId}`, {
      method: 'GET',
      params: {
        page,
        limit: itemsPerPage,
        sortBy: sortBy[0]?.key,
        sortOrder: sortBy[0]?.order,
      },
    });

    return data.value;
  }
}
