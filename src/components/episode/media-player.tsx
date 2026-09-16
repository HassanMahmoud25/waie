"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "./player-context";
import { useLibrary } from "@/hooks/use-library";

/** How often to persist watch progress while the video is actively playing. */
const PROGRESS_SAVE_INTERVAL_MS = 5000;

type YTPlayerInstance = {
  getCurrentTime: () => number;
  destroy: () => void;
};

type YTStateChangeEvent = { data: number };

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: { events?: { onStateChange?: (event: YTStateChangeEvent) => void } },
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** YouTube's "playing" player state (see the IFrame Player API's onStateChange). */
const PLAYING = 1;

let iframeApiPromise: Promise<NonNullable<Window["YT"]>> | null = null;

/**
 * Loads YouTube's small IFrame Player API script once per page (cached
 * across every MediaPlayer instance) so we can read real playback position
 * via the official onStateChange/getCurrentTime API instead of guessing at
 * the embed's undocumented postMessage traffic. This is separate from --
 * and doesn't interfere with -- the raw seekTo/playVideo postMessage calls
 * in player-context.tsx, which keep working unchanged for transcript jumps.
 */
function loadYouTubeIframeApi(): Promise<NonNullable<Window["YT"]>> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (iframeApiPromise) return iframeApiPromise;

  iframeApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return iframeApiPromise;
}

export function MediaPlayer({
  videoId,
  title,
  episodeId,
  durationSeconds,
}: {
  videoId: string;
  title: string;
  episodeId: string;
  durationSeconds: number;
}) {
  const { registerPlayer } = usePlayer();
  const { setProgress } = useLibrary();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    let saveIntervalId: ReturnType<typeof setInterval> | null = null;

    const stopInterval = () => {
      if (saveIntervalId !== null) {
        clearInterval(saveIntervalId);
        saveIntervalId = null;
      }
    };

    const saveProgress = () => {
      const seconds = ytPlayerRef.current?.getCurrentTime();
      if (typeof seconds === "number" && seconds > 0) {
        setProgress(episodeId, seconds, durationSeconds);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) saveProgress();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      ytPlayerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            stopInterval();
            if (event.data === PLAYING) {
              saveIntervalId = setInterval(saveProgress, PROGRESS_SAVE_INTERVAL_MS);
            } else {
              saveProgress();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopInterval();
      saveProgress();
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        // Player never finished initializing -- nothing to tear down.
      }
      ytPlayerRef.current = null;
    };
  }, [episodeId, durationSeconds, setProgress]);

  return (
    <div className="aspect-video overflow-hidden bg-black">
      <iframe
        ref={(el) => {
          registerPlayer(el);
          iframeRef.current = el;
        }}
        className="size-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
