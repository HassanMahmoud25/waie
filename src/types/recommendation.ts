export type RecommendationType =
  | "BOOK"
  | "MOVIE"
  | "PODCAST"
  | "WEBSITE"
  | "PERSON"
  | "PRODUCT"
  | "STUDY"
  | "REFERENCE";

/** Something a host/guest mentioned in an episode — shown in the "التوصيات" tab. */
export type Recommendation = {
  id: string;
  episodeId: string;
  type: RecommendationType;
  title: string;
  description: string;
  /** Why it was mentioned — the editorial value-add over a plain link list. */
  reason: string;
  imageUrl?: string;
  url?: string;
  timestampSeconds?: number;
  order: number;
};
