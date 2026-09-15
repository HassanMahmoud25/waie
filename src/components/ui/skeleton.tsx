import { cn } from "@/lib/utils/cn";

/**
 * Base shimmering block. Compose into shape-specific skeletons
 * (see components/content/loading-skeletons.tsx) rather than using
 * this directly in pages.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}
