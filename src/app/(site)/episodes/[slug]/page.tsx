import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { contentRepository } from "@/lib/repositories";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EpisodeIdentity } from "@/components/episode/episode-identity";
import { EpisodeMeta } from "@/components/episode/episode-meta";
import { EpisodePlayerProvider } from "@/components/episode/player-context";
import { MediaPlayer } from "@/components/episode/media-player";
import { PrevNextNav } from "@/components/episode/prev-next-nav";
import { EpisodeKnowledgeTabs } from "@/components/episode/episode-knowledge-tabs";
import { RelatedEpisodes } from "@/components/episode/related-episodes";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { ShareButton } from "@/components/shared/share-button";
import { MarkWatchedButton } from "@/components/shared/mark-watched-button";
import { HostAvatars } from "@/components/host/host-avatars";
import { Tag } from "@/components/ui/tag";
import { toIso8601Duration } from "@/lib/utils/format";
import { resolveEpisodeHosts } from "@/lib/utils/content";

export async function generateStaticParams() {
  const episodes = await contentRepository.listEpisodes();
  return episodes.map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await contentRepository.getEpisodeBySlug(slug);
  if (!episode) return {};

  return {
    title: episode.title,
    description: episode.description,
    openGraph: {
      type: "video.other",
      title: episode.title,
      description: episode.description,
      images: [{ url: episode.thumbnailUrl }],
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await contentRepository.getEpisodeBySlug(slug);
  if (!episode) notFound();

  const [
    allSeries,
    allTopics,
    recommendations,
    transcript,
    mindMap,
    related,
    adjacent,
  ] = await Promise.all([
    contentRepository.listSeries(),
    contentRepository.listTopics(),
    contentRepository.getRecommendationsByEpisode(episode.id),
    contentRepository.getTranscriptByEpisode(episode.id),
    contentRepository.getMindMapByEpisode(episode.id),
    contentRepository.listRelatedEpisodes(episode.id, 3),
    contentRepository.getAdjacentEpisodes(episode.id),
  ]);

  const seriesById = new Map(allSeries.map((s) => [s.id, s]));
  const series = seriesById.get(episode.seriesId) ?? null;
  const episodeTopics = allTopics.filter((topic) =>
    episode.topicIds.includes(topic.id),
  );
  const episodeUrl = `${siteConfig.url}/episodes/${episode.slug}`;
  const episodeHosts = resolveEpisodeHosts(episode);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        name: episode.title,
        description: episode.description,
        thumbnailUrl: [episode.thumbnailUrl],
        uploadDate: episode.publishedAt.toISOString(),
        duration: toIso8601Duration(episode.durationSeconds),
        embedUrl: `https://www.youtube-nocookie.com/embed/${episode.youtubeVideoId}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: siteConfig.url,
          },
          ...(series
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: series.title,
                  item: `${siteConfig.url}/series/${series.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: series ? 3 : 2,
            name: episode.title,
            item: episodeUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <EpisodePlayerProvider>
          {/* A softly blurred still of the episode's own thumbnail sits behind the
              title block — a cinematic backdrop instead of a flat canvas, fading
              back to the page background before the player starts. Pulled up by
              the header's own top offset (matching series/[slug]'s hero) so the
              backdrop reaches the true top of the viewport instead of cutting off
              in a hard seam right below the floating nav; the added padding-top
              below compensates so the breadcrumb still lands where it did before. */}
          <section className="relative -mt-[80px] overflow-hidden pt-[6.75rem] sm:-mt-[84px] md:pt-[8.25rem]">
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              aria-hidden="true"
            >
              <Image
                src={episode.thumbnailUrl}
                alt=""
                fill
                sizes="100vw"
                className="scale-110 object-cover opacity-25 blur-3xl"
              />
              <div className="absolute inset-0 bg-linear-to-b from-(--canvas)/30 via-[var(--canvas)]/85 to-[var(--canvas)]" />
            </div>

            <div className="container">
              <Breadcrumbs
                items={[
                  { label: "الرئيسية", href: "/" },
                  { label: "السلاسل", href: "/series" },
                  ...(series
                    ? [{ label: series.title, href: `/series/${series.slug}` }]
                    : []),
                  { label: episode.title },
                ]}
              />

              <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
                <div>
                  <EpisodeIdentity
                    episode={episode}
                    series={series}
                    className="eyebrow"
                  />
                  <h1 className="mt-3 max-w-7xl text-3xl font-black leading-[1.4] tracking-[-.05em] md:text-4xl">
                    {episode.title}
                  </h1>
                  <EpisodeMeta episode={episode} className="meta mt-5" />

                  {episodeHosts.length > 0 && (
                    <div className="mt-5 flex items-center gap-3">
                      <HostAvatars
                        hosts={episodeHosts}
                        size="md"
                        ringColor="var(--canvas)"
                      />
                      <p className="text-sm font-bold text-[var(--ink-soft)]">
                        {episodeHosts.map((host) => host.name).join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-2 lg:justify-end">
                  <BookmarkButton episodeId={episode.id} />
                  <ShareButton title={episode.title} url={episodeUrl} />
                  <MarkWatchedButton episodeId={episode.id} />
                </div>
              </div>

              <div className="mt-9 overflow-hidden rounded-[var(--radius-banner)]">
                <MediaPlayer
                  videoId={episode.youtubeVideoId}
                  title={episode.title}
                />
              </div>
            </div>
          </section>

          <section className="container section">
            <div className="grid gap-6 lg:grid-cols-[1fr_.42fr]">
              <article>
                <p className="eyebrow-pill w-fit">عن الحلقة</p>
                <p className="mt-4 max-w-2xl text-xl leading-9 text-[var(--ink-soft)]">
                  {episode.description}
                </p>
                {episodeTopics.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {episodeTopics.map((topic) => (
                      <Link key={topic.id} href={`/topics/${topic.slug}`}>
                        <Tag>{topic.title}</Tag>
                      </Link>
                    ))}
                  </div>
                )}
              </article>
              {series && (
                <aside className="glass-panel p-6 md:p-8">
                  <p className="eyebrow-pill w-fit">تابع السلسلة</p>
                  <h2 className="mt-3 text-2xl font-black tracking-[-.02em]">
                    {series.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    {series.description}
                  </p>
                  <Link
                    href={`/series/${series.slug}`}
                    className="section-link mt-6"
                  >
                    عرض حلقات السلسلة
                  </Link>
                </aside>
              )}
            </div>

            <div className="mt-10">
              <PrevNextNav previous={adjacent.previous} next={adjacent.next} />
            </div>
          </section>

          <section className="section-tint py-14 md:py-20">
            <div className="container">
              <p className="eyebrow-pill w-fit">الحلقة في ثلاث طبقات</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] md:text-4xl">
                أكمل تجربة الحلقة
              </h2>
              <div className="mt-8">
                <EpisodeKnowledgeTabs
                  recommendations={recommendations}
                  transcript={transcript}
                  mindMap={mindMap}
                />
              </div>
            </div>
          </section>
        </EpisodePlayerProvider>

        {related.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="eyebrow-pill w-fit">استكشف أكثر</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] md:text-4xl">
                حلقات قد تهمك
              </h2>
              <div className="mt-8">
                <RelatedEpisodes episodes={related} seriesById={seriesById} />
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
