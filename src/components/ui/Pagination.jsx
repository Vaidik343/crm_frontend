const SIBLINGS = 2; // pages shown on each side of current page

function getPageRange(current, total) {
  // Always show first, last, current ± SIBLINGS, with "..." gaps
  const delta = SIBLINGS;
  const range = [];
  const rangeWithDots = [];

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  for (let i = left; i <= right; i++) range.push(i);
  if (total > 1) range.push(total);

  // Deduplicate and insert dots
  let prev;
  for (const page of range) {
    if (prev) {
      if (page - prev === 2) {
        rangeWithDots.push(prev + 1); // single gap → just show the number
      } else if (page - prev > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(page);
    prev = page;
  }

  return rangeWithDots;
}

const Pagination = ({ page, totalPages, onPageChange, className = "" }) => {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <div className={`flex items-center justify-center gap-1.5 flex-wrap ${className}`}>
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest disabled:opacity-40 hover:bg-slate-200 transition-all"
      >
        ‹ Prev
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dot-${i}`}
            className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
              page === p
                ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20 scale-105"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest disabled:opacity-40 hover:bg-slate-200 transition-all"
      >
        Next ›
      </button>
    </div>
  );
};

export default Pagination;