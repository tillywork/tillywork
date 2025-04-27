import { JSONContent } from '@tiptap/core';

/**
 * Extracts all mention nodes from the content recursively.
 * @param {JSONContent} content - The Tiptap content node.
 * @returns {Array} - Array of mentioned user IDs.
 */
export function extractMentions(content: JSONContent): number[] {
  let mentions: number[] = [];

  if (!content) return mentions;

  if (Array.isArray(content)) {
    content.forEach((node) => {
      mentions = mentions.concat(extractMentions(node));
    });
  } else if (content.type === 'mention' && content.attrs) {
    mentions.push(Number(content.attrs['id']));
  } else if (content.content) {
    mentions = mentions.concat(extractMentions(content.content));
  }

  return mentions;
}

/**
 * Returns mention nodes that exist in newContent but not in oldContent.
 * @param {JSONContent} newContent - The new Tiptap content.
 * @param {JSONContent} [oldContent] - The old Tiptap content (optional).
 * @returns {Array} - Array of mentioned user IDs.
 */
export function getNewMentions(
  newContent: JSONContent,
  oldContent: JSONContent | null = null
): number[] {
  const newMentions = extractMentions(newContent);
  const oldMentions = oldContent ? extractMentions(oldContent) : [];

  // Create a Set of old mention IDs for quick lookup
  const oldMentionIds = new Set(oldMentions);

  // Filter mentions that are in newMentions but not in oldMentions
  const newOnlyMentions = newMentions.filter(
    (userId) => !oldMentionIds.has(userId)
  );

  return newOnlyMentions;
}
