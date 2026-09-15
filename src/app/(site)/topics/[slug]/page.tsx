import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { contentRepository } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EpisodeCard } from "@/components/episode/episode-card";
import { EmptyState } from "@/components/content/empty-state";

export async function generateStaticParams() {
  const topics = await contentRepository.listTopics();
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = await contentRepository.getTopicBySlug(slug);
  if (!topic) return {};
  return { title: topic.title, description: topic.description };
}

export default async function TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await contentRepository.getTopicBySlug(slug);
  if (!topic) notFound();

  const [episodes, series] = await Promise.all([
    contentRepository.listEpisodesByTopic(topic.id),
    contentRepository.listSeries(),
  ]);
  const relatedSeries = series.filter((s) => s.topicId === topic.id);
  const seriesById = new Map(series.map((s) => [s.id, s]));

  return (
    <main className="container py-14">
      <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "الموضوعات" }, { label: topic.title }]} />
      <div className="mt-6 flex items-center gap-5">
        <i
          className="size-16 shrink-0 rounded-full shadow-[var(--shadow-md)]"
          style={{ backgroundColor: topic.color, boxShadow: `0 12px 28px -10px ${topic.color}88` }}
          aria-hidden="true"
        />
        <div>
          <p className="eyebrow-pill w-fit">موضوع</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.03em] md:text-5xl">{topic.title}</h1>
        </div>
      </div>
      <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">{topic.description}</p>

      {relatedSeries.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-black tracking-[-.02em]">سلاسل مرتبطة</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {relatedSeries.map((s) => (
              <Link className="chip" href={`/series/${s.slug}`} key={s.id}>
                {s.title} ←
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-[-.02em] md:text-3xl">حلقات في الموضوع</h2>
        {episodes.length > 0 ? (
          <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => (
              <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="سيُضاف محتوى إلى هذا الموضوع قريبًا" />
        )}
      </section>
    </main>
  );
}
