import { useHttp } from "@/composables/useHttp";
import { useSnackbar } from "@/composables/useSnackbar";

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

  async createContact(contact: CreateContact): Promise<Contact> {
    const { data, sendRequest } = useHttp();

    await sendRequest('/contacts', {
      method: 'POST',
      data: contact,
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

  async updateContact(contact: Contact): Promise<Contact> {
    const { data, sendRequest } = useHttp();

    await sendRequest(`/contacts/${contact.id}`, {
      method: 'PUT',
      data: contact,
    });

    return data.value;
  }

  async deleteContact(contactId: number): Promise<void> {
    const { sendRequest } = useHttp();

    await sendRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  getFullName(contact: Contact): string {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    else if (contact.firstName) {
      return contact.firstName;
    }
    else if (contact.lastName) {
      return contact.lastName;
    }
    else {
      return '';
    }
  }
}