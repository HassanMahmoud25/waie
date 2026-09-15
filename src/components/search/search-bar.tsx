import { Search } from "lucide-react";

/** Plain GET form — works without JavaScript, and /search reads `q` server-side. */
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" className="glass mt-8 flex max-w-2xl items-center gap-2 rounded-[var(--radius-pill)] p-2 pr-5" role="search">
      <label htmlFor="search-input" className="sr-only">
        ابحث في وعي
      </label>
      <Search size={18} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
      <input
        id="search-input"
        name="q"
        defaultValue={defaultValue}
        placeholder="ابحث عن صحابي، فكرة، أو حلقة..."
        className="w-full bg-transparent px-3 py-3 text-[.95rem] outline-none placeholder:text-[var(--muted)]"
      />
      <button className="btn btn-primary shrink-0" type="submit">
        <Search size={16} /> بحث
      </button>
    </form>
  );
}
