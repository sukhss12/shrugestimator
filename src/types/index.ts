export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'NA';

export type ReleaseColour = 'green' | 'amber' | 'purple' | null;

export interface FeatureEstimate {
  id: string;
  name: string;
  fe: TShirtSize;
  be: TShirtSize;
  db: TShirtSize;
  int: TShirtSize;
  selected: boolean;
  colour?: ReleaseColour;
}

export interface PageEstimate {
  name: string;
  features: FeatureEstimate[];
  teamSize: number;
}
