import { useEffect, useRef, useState } from "react";
import { MdSearch, MdKeyboardArrowDown, MdClose } from "react-icons/md";

/**
 * LocalSearchableSelect
 * Searchable dropdown over an ALREADY-LOADED in-memory array.
 * No API calls — pure client-side filtering. Use for small/bounded
 * lists (project-filtered assignees, roles, statuses, etc).
 *
 * For large/unbounded server-paginated lists, use SearchableSelect instead.
 */
const LocalSearchableSelect = ({
  options = [],
  value,
  onChange,
  getId = (o) => o.id,
  getLabel = (o) => o.name,
  getSearchText,                 // optional: (o) => string to match against; defaults to getLabel(o)
  placeholder = "Search...",
  emptyOptionLabel = null,       // set to a string (e.g. "Self Assign") to show a clearable empty option
  disabled = false,
  noResultsLabel = "No matches",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const matchText = getSearchText || getLabel;

  const selected = options.find((o) => getId(o) === value);
  const selectedLabel = selected ? getLabel(selected) : (emptyOptionLabel || "");

  const filtered = query.trim()
    ? options.filter((o) =>
        matchText(o).toLowerCase().includes(query.trim().toLowerCase())
      )
    : options;

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative " ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-slate-50 border border-slate-100 rounded px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        <span className={selected || emptyOptionLabel ? "text-slate-700" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <MdKeyboardArrowDown size={18} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-10 w-full bg-white border border-slate-100 rounded shadow-xl mt-1 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-50">
            <MdSearch size={16} className="text-slate-300 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm font-bold text-slate-700  focus:outline-none bg-transparent"
               autoComplete="off"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500">
                <MdClose size={14} />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {emptyOptionLabel && (
              <div
                onClick={() => handleSelect("")}
                className={`p-3 text-sm font-bold cursor-pointer hover:bg-slate-50 ${
                  !value ? "text-[#132ea7] bg-[#132ea7]/5" : "text-slate-500"
                }`}
              >
                {emptyOptionLabel}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="p-3 text-sm font-bold text-slate-400 text-center">{noResultsLabel}</div>
            ) : (
              filtered.map((opt) => {
                const id = getId(opt);
                return (
                  <div
                    key={id}
                    onClick={() => handleSelect(id)}
                    className={`p-3 text-sm font-bold cursor-pointer hover:bg-slate-50 border-t border-slate-50 ${
                      id === value ? "text-[#132ea7] bg-[#132ea7]/5" : "text-slate-700"
                    }`}
                  >
                    {getLabel(opt)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalSearchableSelect;