import type { User } from '@tillywork/shared';
import { useLogo } from './useLogo';

type Data = { createdByType?: 'system' | 'user'; createdBy?: User };

export const useCreatedBy = () => {
  function getCreatedByPhoto(data: Data) {
    return data.createdByType === 'system'
      ? useLogo().getCheckUrl()
      : data.createdBy?.photo;
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
