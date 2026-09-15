"use client";

import { usePlayer } from "./player-context";

export function MediaPlayer({ videoId, title }: { videoId: string; title: string }) {
  const { registerPlayer } = usePlayer();

  return (
    <div className="aspect-video overflow-hidden bg-black">
      <iframe
        ref={registerPlayer}
        className="size-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
