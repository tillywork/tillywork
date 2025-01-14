import { useHttp } from '@/composables/useHttp';
import type { User, CardType } from '@tillywork/shared';

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
