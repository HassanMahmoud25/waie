import type { ContentStatus } from "./content-status";
import type { Series } from "./series";

export type Episode = {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  thumbnailUrl: string;
  /** Editorial-only numbering (Waie's own "وعي N" scheme) -- null until an editor sets it; never inferred from YouTube. */
  episodeNumber: number | null;
  durationSeconds: number;
  publishedAt: Date;
  status: ContentStatus;
  featured: boolean;
  seriesId: string;
  topicIds: string[];
  /**
   * Host ids (see data/hosts.ts) who actually appear in this episode.
   * Optional/undefined — not "no hosts" — meaning "use the show's default
   * lineup" (see resolveEpisodeHosts in lib/utils/content.ts). Set this
   * explicitly per episode once real per-episode lineups are known (a solo
   * episode, a guest takeover, etc.).
   */
  hosts?: string[];
};

/** Episode enriched with its resolved series — used wherever a card needs the series title. */
export type EpisodeWithSeries = Episode & {
  series: Series | null;
};
