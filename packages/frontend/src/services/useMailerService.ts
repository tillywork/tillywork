import type { User } from '@/components/common/users/types';
import { useHttp } from '@/composables/useHttp';
import type { CardType } from '@/components/project-management/cards/types';

export type SendMentionNotificationParams = {
  userId: number;
  mentionedBy: User;
  cardType: CardType;
  route: string;
};

export const useMailerService = () => {
  const { sendRequest } = useHttp();

  function sendMentionNotificationEmail({
    userId,
    mentionedBy,
    cardType,
    route,
  }: SendMentionNotificationParams) {
    return sendRequest('/mailer/mention', {
      method: 'POST',
      data: {
        userId,
        mentionedBy,
        cardType,
        route,
      },
    });
  }

  return {
    sendMentionNotificationEmail,
  };
};
