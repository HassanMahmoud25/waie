import Image from "next/image";
import { BookMarked, BookOpen, Clapperboard, ExternalLink, FlaskConical, Globe, Mic, Package, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Recommendation, RecommendationType } from "@/types/recommendation";
import { TimestampButton } from "./timestamp-button";
import { EmptyState } from "@/components/content/empty-state";

const typeMeta: Record<RecommendationType, { label: string; icon: LucideIcon }> = {
  BOOK: { label: "كتاب", icon: BookOpen },
  MOVIE: { label: "فيلم", icon: Clapperboard },
  PODCAST: { label: "بودكاست", icon: Mic },
  WEBSITE: { label: "موقع", icon: Globe },
  PERSON: { label: "شخصية", icon: UserRound },
  PRODUCT: { label: "منتج", icon: Package },
  STUDY: { label: "دراسة", icon: FlaskConical },
  REFERENCE: { label: "مرجع", icon: BookMarked },
};

/** The "التوصيات" tab: things a host/guest mentioned, with why they were mentioned front and center. */
export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return <EmptyState title="لم تتم إضافة توصيات لهذه الحلقة بعد." />;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {recommendations.map((recommendation) => {
        const meta = typeMeta[recommendation.type];
        const Icon = meta.icon;

        return (
          <li key={recommendation.id} className="glass-panel flex gap-4 p-5">
            {recommendation.imageUrl ? (
              <div className="media relative h-24 w-20 shrink-0 overflow-hidden">
                <Image src={recommendation.imageUrl} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ) : (
              <div className="grid h-24 w-20 shrink-0 place-items-center rounded-[var(--radius-image)] bg-[var(--surface-strong)] text-[var(--accent-strong)]">
                <Icon size={22} aria-hidden="true" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-strong)]">
                <Icon size={13} aria-hidden="true" /> {meta.label}
              </div>
              <h3 className="mt-1.5 text-base font-black leading-snug">{recommendation.title}</h3>
              {recommendation.description && (
                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{recommendation.description}</p>
              )}
              {recommendation.reason && (
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  <span className="font-bold text-[var(--ink)]">لماذا ذُكر؟ </span>
                  {recommendation.reason}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4">
                {typeof recommendation.timestampSeconds === "number" && (
                  <TimestampButton seconds={recommendation.timestampSeconds} />
                )}
                {recommendation.url && (
                  <a
                    href={recommendation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  >
                    <ExternalLink size={13} aria-hidden="true" /> رابط خارجي
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
