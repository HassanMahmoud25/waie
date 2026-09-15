"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Play, Search, X } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { SearchResults } from "@/types/search";
import type { Topic } from "@/types/topic";
import { formatDuration } from "@/lib/utils/format";
import { listQuickTopicsAction, searchContentAction } from "@/app/(site)/search/actions";
import { SearchResultRow } from "./search-result-row";

const DEBOUNCE_MS = 250;
const TRANSITION_MS = 220;

/**
 * Command-palette-style search: a portal-rendered overlay so it always
 * escapes the header's own `backdrop-filter` (which, like `transform`,
 * creates a containing block that would otherwise trap a `position: fixed`
 * descendant inside the header's box instead of the viewport).
 *
 * Deliberately reuses `contentRepository.search()` via a server action
 * (`app/search/actions.ts`) rather than duplicating the matching logic —
 * the full `/search?q=` page keeps working unchanged as a direct-link /
 * no-JS fallback; this is just a faster way to reach the same results.
 */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  // Keeps the modal in the DOM for the closing animation; the CSS drives the
  // open/close animation itself off the `data-state` attribute (see the
  // `.search-modal-*` keyframes in globals.css), so no JS-timed class flip
  // is needed to kick off the enter animation.
  const [shouldRender, setShouldRender] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Mount immediately on open; on close, stay mounted long enough to play
  // the exit animation, then unmount.
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  // Lock page scroll, focus the input, and lazily load the quick-browse topics.
  useEffect(() => {
    if (!shouldRender) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    if (!topics) {
      listQuickTopicsAction().then(setTopics).catch(() => setTopics([]));
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRender]);

  // Reset once fully closed (after the exit transition) so the next open starts clean.
  useEffect(() => {
    if (!shouldRender) {
      setQuery("");
      setResults(null);
    }
  }, [shouldRender]);

  // Debounced live search.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        const next = await searchContentAction(trimmed);
        setResults(next);
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !shouldRender) return null;

  const trimmed = query.trim();
  const totalResults = results ? results.episodes.length + results.series.length + results.topics.length : 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-center px-4 pt-[8vh] sm:pt-[12vh]">
      <div
        className="search-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={open ? "open" : "closed"}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="البحث في وعي"
        data-state={open ? "open" : "closed"}
        className="search-modal-panel glass-strong relative z-10 h-fit max-h-[76vh] w-full max-w-2xl overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center gap-3 border-b border-white/50 px-5 py-4 sm:px-6">
          <Search size={20} className="shrink-0 text-[var(--ink-soft)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن صحابي، فكرة، أو حلقة..."
            className="w-full min-w-0 bg-transparent text-base font-bold outline-none placeholder:font-normal placeholder:text-[var(--muted)] sm:text-lg"
            aria-label="ابحث في وعي"
          />
          <kbd className="hidden shrink-0 rounded-md border border-[var(--line)] px-1.5 py-0.5 text-[.7rem] font-bold text-[var(--muted)] sm:block">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق البحث"
            className="icon-btn shrink-0 !size-9"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[calc(76vh-73px)] overflow-y-auto p-3 sm:p-4">
          {!trimmed && (
            <div className="px-2 py-2">
              <p className="mb-3 text-xs font-bold text-[var(--muted)]">ابدأ من هذه الموضوعات</p>
              <div className="flex flex-wrap gap-2">
                {(topics ?? []).map((topic) => (
                  <Link key={topic.id} href={`/topics/${topic.slug}`} className="chip">
                    <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: topic.color }} aria-hidden="true" />
                    {topic.title}
                  </Link>
                ))}
                {!topics && <span className="skeleton h-9 w-full" />}
              </div>
            </div>
          )}

          {trimmed && isPending && !results && (
            <div className="py-14 text-center text-sm font-bold text-[var(--muted)]">جارٍ البحث…</div>
          )}

          {trimmed && results && totalResults === 0 && (
            <div className="empty-state">
              <p className="font-bold text-[var(--ink)]">لم نجد نتائج مطابقة لـ«{trimmed}»</p>
              <p className="mt-1 text-sm">جرّب كلمة أبسط، أو تصفّح الموضوعات أعلاه.</p>
            </div>
          )}

          {trimmed && results && totalResults > 0 && (
            <div className="flex flex-col gap-2">
              {(results.series.length > 0 || results.topics.length > 0) && (
                <div className="flex flex-col gap-1.5">
                  {results.series.map((item) => (
                    <SearchResultRow item={item} kind="series" key={item.id} />
                  ))}
                  {results.topics.map((item) => (
                    <SearchResultRow item={item} kind="topic" key={item.id} />
                  ))}
                </div>
              )}

              {results.episodes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {results.episodes.slice(0, 8).map((episode) => (
                    <EpisodeResultRow episode={episode} key={episode.id} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {trimmed && (
          <div className="border-t border-white/50 px-5 py-3 sm:px-6">
            <Link href={`/search?q=${encodeURIComponent(trimmed)}`} className="section-link">
              عرض كل النتائج في صفحة البحث
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function EpisodeResultRow({ episode }: { episode: Episode }) {
  return (
    <Link href={`/episodes/${episode.slug}`} className="glass-panel hover-zoom flex items-center gap-3 p-2.5">
      <div className="media relative aspect-video w-24 shrink-0 overflow-hidden sm:w-28">
        <Image src={episode.thumbnailUrl} alt="" fill sizes="112px" className="object-cover" />
        <span className="play-mark">
          <Play size={11} fill="currentColor" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{episode.title}</p>
        <p className="mt-1 text-xs font-bold text-[var(--muted)]">{formatDuration(episode.durationSeconds)}</p>
      </div>
    </Link>
  );
}
