import type { TShirtSize } from '@/types';

export const SIZE_DAYS: Record<TShirtSize, number> = {
  XS: 0.5,
  S: 1,
  M: 2,
  L: 5,
  XL: 10,
  NA: 0,
};

export const SIZE_LABELS: Record<TShirtSize, string> = {
  XS: 'Few hours',
  S: '1 day',
  M: '2 days',
  L: '1 week',
  XL: '2 weeks',
  NA: 'N/A',
};

export const WORKING_DAYS_PER_WEEK = 5;

export const APPETITE_OPTIONS = [2, 4, 6, 8, 12] as const;
