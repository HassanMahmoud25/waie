"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import type { ReactNode } from "react";

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";

type PlayerContextValue = {
  seekTo: (seconds: number) => void;
  registerPlayer: (iframe: HTMLIFrameElement | null) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

/** Read by transcript/recommendation timestamps to jump the video (see MediaPlayer). */
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within <EpisodePlayerProvider>");
  }
  return context;
}

/**
 * The one client boundary on the episode page: wraps the video player and
 * the knowledge tabs so a timestamp anywhere inside can seek the player via
 * the YouTube embed's postMessage API, without loading its full JS SDK.
 */
export function EpisodePlayerProvider({ children }: { children: ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const registerPlayer = useCallback((iframe: HTMLIFrameElement | null) => {
    iframeRef.current = iframe;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const post = (func: string, args: unknown[] = []) =>
      iframe.contentWindow!.postMessage(JSON.stringify({ event: "command", func, args }), YOUTUBE_ORIGIN);

    post("seekTo", [seconds, true]);
    post("playVideo");
    iframe.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return <PlayerContext.Provider value={{ seekTo, registerPlayer }}>{children}</PlayerContext.Provider>;
}
