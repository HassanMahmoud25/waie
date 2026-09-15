import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { LibraryContent } from "@/components/library/library-content";

export const metadata: Metadata = { title: "مكتبتي" };

export default async function LibraryPage() {
  const [episodes, series] = await Promise.all([
    contentRepository.listEpisodes(),
    contentRepository.listSeries(),
  ]);

  return (
    <main className="container py-14">
      <p className="eyebrow-pill w-fit">مساحتك الخاصة</p>
      <h1 className="mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">
        مكتبتي
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
        تُحفظ الحلقات والمشاهدات هنا على هذا الجهاز. سجّل الدخول لاحقًا
        لمزامنتها عبر أجهزتك.
      </p>

      <LibraryContent episodes={episodes} series={series} />
    </main>
  );
}
