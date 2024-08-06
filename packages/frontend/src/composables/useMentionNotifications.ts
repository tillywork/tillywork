import { useAuthStore } from '@/stores/auth';
import type { Content } from '@tiptap/vue-3';
import {
  useMailerService,
  type SendMentionNotificationParams,
} from '@/services/useMailerService';

export function useMentionNotifications() {
  const { sendMentionNotificationEmail } = useMailerService();
  const { user } = storeToRefs(useAuthStore());

  async function notifyMentionedUser({
    mentionedBy,
    userId,
    cardType,
    route,
  }: SendMentionNotificationParams) {
    await sendMentionNotificationEmail({
      userId,
      mentionedBy,
      cardType,
      route,
    });
  }

  function getMentionedUsers(content: Content) {
    const mentions = new Set<number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function traverse(node: any) {
      if (node?.type === 'mention') {
        mentions.add(node.attrs.id);
      }
      if (node?.content) {
        node.content.forEach(traverse);
      }
    }
    traverse(content);
    return mentions;
  }

  function getNewMentions(newContent: Content, oldContent: Content) {
    const oldMentions = getMentionedUsers(oldContent);
    const newMentions = getMentionedUsers(newContent);
    return [...newMentions].filter(
      (id) => user.value?.id !== id && !oldMentions.has(id)
    );
  }

  return {
    notifyMentionedUser,
    getNewMentions,
  };
}
