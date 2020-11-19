/**
 * Tags that can be shown on any of the now playing themes
 */
export const availableTags = ['album', 'label', 'comment', 'tempo', 'key'] as const;

export type Tags = Array<typeof availableTags[number]>;
