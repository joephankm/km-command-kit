import type { BoxAlign } from '../types/boxTypes';

/**
 * Alignment, padding, and fill character used to format content to a width.
 */
export type FormatContentOptions = {
  /** Aligns content when the available width exceeds its length. */
  align?: BoxAlign;
  /** Number of blank columns placed on each side of the content. */
  padding?: number;
  /** Character used to fill unused width. */
  fill?: string;
};

/**
 * Fits cell content to the requested width, adding side padding and filling any remaining space.
 * Empty cells are filled across the full width.
 */
export const formatContent = (
  content: string | undefined,
  width: number,
  { align, padding = 1, fill }: FormatContentOptions = {}
): string => {
  const pad = padding > 1 ? ' '.repeat(padding) : ' ';
  const text = pad + (content ?? '') + pad;

  if (align === 'right') return text.padStart(width, fill);

  if (align === 'center') {
    const room = Math.max(width - text.length, 0);
    return text.padStart(text.length + Math.floor(room / 2), fill).padEnd(width, fill);
  }

  return text.padEnd(width, fill);
};
