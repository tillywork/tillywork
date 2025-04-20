import type { CreatedByType, User } from '@tillywork/shared';
import { useLogo } from './useLogo';

type Data = { createdByType?: CreatedByType; createdBy?: User };

export const useCreatedBy = () => {
  function getCreatedByPhoto(data: Data) {
    return data.createdByType === 'user'
      ? data.createdBy?.photo
      : useLogo().getCheckUrl();
  }

  function getCreatedByName(data: Data) {
    return data.createdByType === 'system'
      ? 'System'
      : data.createdBy?.firstName + ' ' + data.createdBy?.lastName;
  }

  return {
    getCreatedByPhoto,
    getCreatedByName,
  };
};
