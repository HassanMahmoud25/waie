import type { Series } from "@/types/series";

/**
 * The 5 real, named playlists on the Waie YouTube channel at import time.
 * The channel also has a generic "بودكاست وعي" catch-all playlist (76
 * videos) that is not a distinct series -- it is simply the whole show's
 * feed, so episodes that aren't in one of the 5 series below intentionally
 * have no series (see data/episodes.ts) rather than being force-fit here.
 */
export const series: Series[] = [
  {
    id: "series-companions",
    slug: "companions",
    title: "سلسلة الصحابة",
    description: "حكايات صادقة عن رجال ونساء صنعوا المعنى قبل أن يصنعوا التاريخ.",
    coverImage: "/series/companions.png",
    coverImageMobile: "/series/companions-mobile.png",
    topicId: "topic-companions",
    status: "PUBLISHED",
  },
  {
    id: "series-stories",
    slug: "stories",
    title: "سلسلة القصص",
    description: "أحسن القصص كما وردت في القرآن، بقلم يعيد قراءتها بوعي معاصر.",
    coverImage: "/series/stories.png",
    coverImageMobile: "/series/stories-mobile.png",
    topicId: "topic-stories",
    status: "PUBLISHED",
  },
  {
    id: "series-worship-seasons",
    slug: "worship-seasons",
    title: "مواسم العبادات",
    description: "حلقات مرتبطة بمواسم العبادة كرمضان والحج وعشر ذي الحجة.",
    coverImage: "/series/worship-seasons.png",
    coverImageMobile: "/series/worship-seasons-mobile.png",
    topicId: "topic-worship-seasons",
    status: "PUBLISHED",
  },
  {
    id: "series-ethics",
    slug: "ethics",
    title: "سلسلة الأخلاق",
    description: "حلقات في الأخلاق والقيم وأثرها في حياة الفرد والمجتمع.",
    coverImage: "/series/ethics.png",
    coverImageMobile: "/series/ethics-mobile.png",
    topicId: "topic-ethics",
    status: "PUBLISHED",
  },
  {
    id: "series-commitment",
    slug: "commitment",
    title: "التدين والالتزام",
    description: "حلقات حول معنى الالتزام الديني وكيفية بنائه خطوة بخطوة.",
    coverImage: "/series/commitment.png",
    coverImageMobile: "/series/commitment-mobile.png",
    topicId: "topic-commitment",
    status: "PUBLISHED",
  },
];
