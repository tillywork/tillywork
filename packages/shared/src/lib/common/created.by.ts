import { User } from '../..';

export type CreatedByType = 'system' | 'user' | 'automation';

type Data = { createdByType?: CreatedByType; createdBy?: User };

export function getCreatedByName(data: Data) {
  switch (data.createdByType) {
    case 'automation':
      return 'An automation';
    case 'user':
      return data.createdBy?.firstName + ' ' + data.createdBy?.lastName;
    case 'system':
    default:
      return 'System';
  }
}
