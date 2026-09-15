import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import { EpisodeCard } from "./episode-card";
import { HorizontalEpisodeCard } from "./horizontal-episode-card";

/** One prominent pick plus supporting picks — never four identical cards. */
export function RelatedEpisodes({
  episodes,
  seriesById,
}: {
  episodes: Episode[];
  seriesById: Map<string, Series>;
}) {
  if (episodes.length === 0) return null;
  const [prominent, ...supporting] = episodes;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <EpisodeCard
        episode={prominent}
        series={seriesById.get(prominent.seriesId) ?? null}
      />
      {supporting.length > 0 && (
        <div className="flex flex-col gap-0">
          {supporting.map((episode) => (
            <HorizontalEpisodeCard
              episode={episode}
              series={seriesById.get(episode.seriesId) ?? null}
              key={episode.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
