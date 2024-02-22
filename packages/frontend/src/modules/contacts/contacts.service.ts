import { useHttp } from "@/composables/useHttp";

export interface GetContactsParams {
  projectId: string;
  page: number;
  itemsPerPage: number;
  sortBy: {
    key: string;
    order: string;
  }[]
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  ownerId: string;
  createdAt: string;
}

export interface ContactsData {
  contacts: Contact[];
  total: number;
}

export class ContactsService {
  async getContacts({ projectId, page, itemsPerPage, sortBy }: GetContactsParams): Promise<ContactsData> {
    const { data, sendRequest } = useHttp();

    await sendRequest('/contacts', {
      method: 'GET',
      params: {
        projectId,
        page,
        limit: itemsPerPage,
        sortBy: sortBy[0]?.key,
        sortOrder: sortBy[0]?.order,
      },
    });

    return data.value;
  }

  async getContact(contactId: number): Promise<Contact> {
    const { data, sendRequest } = useHttp();

    await sendRequest(`/contacts/${contactId}`, {
      method: 'GET',
    });

    return data.value;
  }

  async deleteContact(contactId: number): Promise<void> {
    const { sendRequest } = useHttp();

    await sendRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }
}