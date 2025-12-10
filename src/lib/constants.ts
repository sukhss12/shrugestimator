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
  XS: { max: 2, label: '< 2 wks', sprints: '< 1 sprint' },
  S:  { max: 4, label: '2–4 wks', sprints: '1–2 sprints' },
  M:  { max: 8, label: '4–8 wks', sprints: '2–4 sprints' },
  L:  { max: 12, label: '8–12 wks', sprints: '4–6 sprints' },
  XL: { max: Infinity, label: '12+ wks', sprints: '6+ sprints' }
};

export const getJourneySize = (calendarWeeks: number): string => {
  if (calendarWeeks < 2) return 'XS';
  if (calendarWeeks < 4) return 'S';
  if (calendarWeeks < 8) return 'M';
  if (calendarWeeks < 12) return 'L';
  return 'XL';
};
