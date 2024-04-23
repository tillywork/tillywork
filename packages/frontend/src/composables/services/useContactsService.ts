import { useHttp } from '@/composables/useHttp';

export interface GetContactsParams {
  projectId: string;
  page?: number;
  itemsPerPage?: number;
  sortBy?: {
    key: string;
    order: string;
  }[];
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  emails: string[];
  phoneNumber: string;
  photo: string;
  ownerId: string;
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

export interface ContactsData {
  contacts: Contact[];
  total: number;
}

export const useContactsService = () => {
  async function getContacts({
    projectId,
    page = 1,
    itemsPerPage = 10,
    sortBy = [
      {
        key: 'createdAt',
        order: 'desc',
      },
    ],
  }: GetContactsParams): Promise<ContactsData> {
    const { sendRequest } = useHttp();

    return sendRequest('/contacts', {
      method: 'GET',
      params: {
        projectId,
        page,
        limit: itemsPerPage,
        sortBy: sortBy[0]?.key,
        sortOrder: sortBy[0]?.order,
      },
    });
  }

  async function createContact(contact: CreateContact): Promise<Contact> {
    const { sendRequest } = useHttp();

    return sendRequest('/contacts', {
      method: 'POST',
      data: contact,
    });
  }

  async function getContact(contactId: number): Promise<Contact> {
    const { sendRequest } = useHttp();

    return sendRequest(`/contacts/${contactId}`, {
      method: 'GET',
    });
  }

  async function updateContact(contact: Contact): Promise<Contact> {
    const { sendRequest } = useHttp();

    return sendRequest(`/contacts/${contact.id}`, {
      method: 'PUT',
      data: contact,
    });
  }

  async function deleteContact(contactId: number): Promise<void> {
    const { sendRequest } = useHttp();

    return sendRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  function getFullName(contact: Contact): string {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    } else if (contact.firstName) {
      return contact.firstName;
    } else if (contact.lastName) {
      return contact.lastName;
    } else {
      return '';
    }
  }

  return {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    getFullName,
  };
};
