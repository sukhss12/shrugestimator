export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'NA';

export interface FeatureEstimate {
  id: string;
  name: string;
  fe: TShirtSize;
  be: TShirtSize;
  db: TShirtSize;
  int: TShirtSize;
  selected: boolean;
}

export interface PageEstimate {
  name: string;
  features: FeatureEstimate[];
  teamSize: number;
}
