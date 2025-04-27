import { User } from '../..';

export type CreatedByType = 'system' | 'user' | 'automation';

type Data = { createdByType?: CreatedByType; createdBy?: User };

export function getCreatedByName(data: Data) {
  return data.createdByType === 'system'
    ? 'System'
    : data.createdBy?.firstName + ' ' + data.createdBy?.lastName;
}
