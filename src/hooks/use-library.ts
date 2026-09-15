"use client";

import { useCallback, useEffect, useState } from "react";

type ProgressEntry = { seconds: number; completed: boolean };
type LibraryState = { savedEpisodeIds: string[]; progress: Record<string, ProgressEntry> };

const STORAGE_KEY = "waie:library:v1";
const emptyState: LibraryState = { savedEpisodeIds: [], progress: {} };

function readState(): LibraryState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState;
  } catch {
    return emptyState;
  }
}

function writeState(state: LibraryState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing, storage full, etc. — the UI still works for this session.
  }
}

/**
 * Local, per-device stand-in for a real account: saved episodes and watch
 * progress persisted to localStorage. Deliberately shaped like the
 * SavedEpisode/WatchProgress Prisma models already in the schema, so
 * wiring a real signed-in backend later means swapping this hook's
 * internals, not the components that call it.
 */
export function useLibrary() {
  const [state, setState] = useState<LibraryState>(emptyState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setIsHydrated(true);
  }, []);

  const isSaved = useCallback((episodeId: string) => state.savedEpisodeIds.includes(episodeId), [state]);

  const toggleSaved = useCallback((episodeId: string) => {
    setState((prev) => {
      const next: LibraryState = {
        ...prev,
        savedEpisodeIds: prev.savedEpisodeIds.includes(episodeId)
          ? prev.savedEpisodeIds.filter((id) => id !== episodeId)
          : [...prev.savedEpisodeIds, episodeId],
      };
      writeState(next);
      return next;
    });
  }, []);

  const getProgress = useCallback((episodeId: string) => state.progress[episodeId], [state]);

  const toggleCompleted = useCallback((episodeId: string) => {
    setState((prev) => {
      const existing = prev.progress[episodeId];
      const next: LibraryState = {
        ...prev,
        progress: {
          ...prev.progress,
          [episodeId]: { seconds: existing?.seconds ?? 0, completed: !existing?.completed },
        },
      };
      writeState(next);
      return next;
    });
  }, []);

  return {
    isHydrated,
    savedEpisodeIds: state.savedEpisodeIds,
    progress: state.progress,
    isSaved,
    toggleSaved,
    getProgress,
    toggleCompleted,
  };
}
