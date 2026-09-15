import type { Recommendation } from "@/types/recommendation";

/**
 * Recommendations (books/people/references a host mentions in an episode)
 * require actually watching and annotating each episode — not something
 * derivable from YouTube's public channel/video metadata. Left empty for
 * the real import; the "التوصيات" tab's empty state covers this until an
 * editor adds real recommendations per episode via the admin.
 */
export const recommendations: Recommendation[] = [];
