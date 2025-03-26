import type { CreatedByType, User } from '@tillywork/shared';
import { useLogo } from './useLogo';

type Data = { createdByType?: CreatedByType; createdBy?: User };

export const useCreatedBy = () => {
  function getCreatedByPhoto(data: Data) {
    return data.createdByType === 'system'
      ? useLogo().getCheckUrl()
      : data.createdBy?.photo;
  }

  function getCreatedByIcon(data: Data) {
    return data.createdByType === 'automation' ? 'mdi-creation' : undefined;
  }

  function getCreatedByName(data: Data) {
    return data.createdByType === 'system'
      ? 'System'
      : data.createdBy?.firstName + ' ' + data.createdBy?.lastName;
  }

  return {
    getCreatedByPhoto,
    getCreatedByName,
    getCreatedByIcon,
  };
};
