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

export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 10;

export const SCOPE_OPTIONS = [1, 2, 3, 4, 6, 8, 10, 12] as const;

export const JOURNEY_SIZE_BANDS = {
  XS: { max: 10, label: '< 10 days', sprints: '< 1 sprint' },
  S:  { max: 20, label: '10–20 days', sprints: '1–2 sprints' },
  M:  { max: 40, label: '20–40 days', sprints: '2–4 sprints' },
  L:  { max: 60, label: '40–60 days', sprints: '4–6 sprints' },
  XL: { max: Infinity, label: '60+ days', sprints: '6+ sprints' }
};

export const getJourneySize = (totalDays: number): string => {
  if (totalDays < 10) return 'XS';
  if (totalDays < 20) return 'S';
  if (totalDays < 40) return 'M';
  if (totalDays < 60) return 'L';
  return 'XL';
};
