"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Episode } from "@/types/episode";
import { useLibrary } from "@/hooks/use-library";
import { EpisodeListItem } from "@/components/episode/episode-list-item";

/** Horizontal bow of each gap segment's curve -- the taller row gap gives
 *  this room to read as a real lean rather than a jitter. */
const WAVE_AMPLITUDE = 18;

type Point = { x: number; y: number };
type CardSpan = { x: number; top: number; bottom: number };

/** One cubic-bezier "lean" from (x1,y1) to (x2,y2), alternating which side
 *  it bows toward by `index` so consecutive gaps read as a single wave. */
function curveTo(x1: number, y1: number, x2: number, y2: number, index: number) {
  const bow = index % 2 === 0 ? WAVE_AMPLITUDE : -WAVE_AMPLITUDE;
  const c1x = x1 + (x2 - x1) / 3 + bow;
  const c1y = y1 + (y2 - y1) / 3;
  const c2x = x1 + ((x2 - x1) * 2) / 3 - bow;
  const c2y = y1 + ((y2 - y1) * 2) / 3;
  return `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
}

/** One continuous path: a wavy lean from the start pin into the first
 *  card, a straight run through each card's own middle (invisible under
 *  its thumbnail anyway), a wavy lean across each gap, and a final lean
 *  into the end pin. */
function buildRoutePath(start: Point, cards: CardSpan[], end: Point): string {
  let d = `M ${start.x} ${start.y}`;
  d += ` ${curveTo(start.x, start.y, cards[0].x, cards[0].top, 0)}`;
  d += ` L ${cards[0].x} ${cards[0].bottom}`;

  for (let i = 1; i < cards.length; i++) {
    d += ` ${curveTo(cards[i - 1].x, cards[i - 1].bottom, cards[i].x, cards[i].top, i)}`;
    d += ` L ${cards[i].x} ${cards[i].bottom}`;
  }

  const last = cards[cards.length - 1];
  d += ` ${curveTo(last.x, last.bottom, end.x, end.y, cards.length)}`;
  return d;
}

/**
 * Renders the series' episodes as landmarks along one continuous dotted
 * route -- a start pin, a wavy line threading through/behind each
 * thumbnail and reappearing in the gaps, and an end pin. The path's `d` is
 * computed from the actual on-screen position of the start pin, every
 * thumbnail, and the end pin (see buildRoutePath), so it stays correct
 * regardless of how tall any given row's description happens to render.
 */
export function SeriesEpisodeList({ episodes }: { episodes: Episode[] }) {
  const { isHydrated, getProgress } = useLibrary();
  const containerRef = useRef<HTMLDivElement>(null);
  const startPinRef = useRef<HTMLDivElement>(null);
  const endPinRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [pathD, setPathD] = useState("");

  useLayoutEffect(() => {
    const container = containerRef.current;
    const startPin = startPinRef.current;
    const endPin = endPinRef.current;
    if (!container || !startPin || !endPin) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const relative = (rect: DOMRect) => ({
        x: rect.left - containerRect.left + rect.width / 2,
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top,
      });

      const cards = mediaRefs.current
        .filter((el): el is HTMLDivElement => Boolean(el))
        .map((el) => relative(el.getBoundingClientRect()));
      if (cards.length === 0) {
        setPathD("");
        return;
      }

      const startSpan = relative(startPin.getBoundingClientRect());
      const endSpan = relative(endPin.getBoundingClientRect());
      const start = { x: startSpan.x, y: (startSpan.top + startSpan.bottom) / 2 };
      const end = { x: endSpan.x, y: (endSpan.top + endSpan.bottom) / 2 };

      setPathD(buildRoutePath(start, cards, end));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [episodes.length, isHydrated]);

  return (
    <div className="journey" ref={containerRef}>
      <svg className="journey-route" aria-hidden="true">
        <path d={pathD} />
      </svg>

      <div className="journey-pin journey-pin--start" ref={startPinRef}>
        <span className="journey-pin__icon">
          <MapPin size={15} strokeWidth={2.25} />
        </span>
        <span>بداية السلسلة</span>
      </div>

      <ol className="journey-list">
        {episodes.map((episode, index) => {
          const progress = isHydrated ? getProgress(episode.id) : undefined;
          const percent = progress ? Math.min(100, (progress.seconds / episode.durationSeconds) * 100) : undefined;

          return (
            <EpisodeListItem
              key={episode.id}
              episode={episode}
              order={index + 1}
              isCompleted={Boolean(progress?.completed)}
              progressPercent={percent}
              mediaRef={(el) => {
                mediaRefs.current[index] = el;
              }}
            />
          );
        })}
      </ol>

      <div className="journey-pin journey-pin--end" ref={endPinRef}>
        <span className="journey-pin__icon">
          <MapPin size={15} strokeWidth={2.25} />
        </span>
        <span>نهاية السلسلة</span>
      </div>
    </div>
  );
}
