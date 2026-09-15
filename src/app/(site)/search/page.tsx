import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResultRow } from "@/components/search/search-result-row";
import { EpisodeCard } from "@/components/episode/episode-card";
import { EmptyState } from "@/components/content/empty-state";
import { TopicChip } from "@/components/topic/topic-chip";

export const metadata: Metadata = { title: "البحث" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [results, series, topics] = await Promise.all([
    contentRepository.search(query),
    contentRepository.listSeries(),
    contentRepository.listTopics(),
  ]);
  const seriesById = new Map(series.map((s) => [s.id, s]));
  const totalResults = results.episodes.length + results.series.length + results.topics.length;

  return (
    <main className="container py-14">
      <p className="eyebrow-pill w-fit">اكتشف بوضوح</p>
      <h1 className="mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">ابحث في وعي</h1>
      <SearchBar defaultValue={query} />

      {query ? (
        <section className="mt-10">
          <p className="text-sm font-bold text-[var(--ink-soft)]">
            {totalResults} نتيجة لعبارة «{query}»
          </p>

          {totalResults === 0 && (
            <EmptyState title="لم نجد نتائج مطابقة" description="جرّب كلمة أبسط أو تصفّح الموضوعات أدناه." />
          )}

          {(results.series.length > 0 || results.topics.length > 0) && (
            <div className="mt-6 flex flex-col gap-3">
              {results.series.map((s) => (
                <SearchResultRow item={s} kind="series" key={s.id} />
              ))}
              {results.topics.map((topic) => (
                <SearchResultRow item={topic} kind="topic" key={topic.id} />
              ))}
            </div>
          )}

          {results.episodes.length > 0 && (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.episodes.map((episode) => (
                <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-12">
          <h2 className="text-xl font-black">ابدأ من هذه الموضوعات</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-7 gap-y-1 sm:grid-cols-3">
            {topics.map((topic) => (
              <TopicChip topic={topic} key={topic.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
