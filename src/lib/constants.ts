import type { TShirtSize } from '@/types';

export const SIZE_POINTS: Record<TShirtSize, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
  NA: 0,
};

export const SIZE_LABELS: Record<TShirtSize, string> = {
  XS: 'Hours',
  S: '½–1 day',
  M: '1–2 days',
  L: '3–5 days',
  XL: '1 week+',
  NA: 'N/A',
};

export const POINTS_PER_DEV_DAY = 5;
