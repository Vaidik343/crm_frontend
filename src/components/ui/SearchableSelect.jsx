import { useEffect, useRef, useState } from "react";
import api from "../../api/axiosInstance";

const SearchableSelect = ({
  endpoint,           // e.g. ENDPOINTS.CALLS.ALL
  value,              // currently selected id
  selectedLabel,      // label to show when closed
  onChange,           // (id) => void
  getLabel,           // (item) => string
  placeholder = "Search...",
  emptyOptionLabel = "None",
  limit = 10,
   extraParams = {}, 
   required,
error
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const fetchPage = async (pageNum, search, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit, ...extraParams });
      // console.log("🚀 ~ fetchPage ~ params:", params)
      if (search) params.set("search", search);
      const { data } = await api.get(`${endpoint}?${params.toString()}`);
      setOptions((prev) => (append ? [...prev, ...(data.data || [])] : data.data || []));
      setHasMore(pageNum * limit < data.total);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const debounce = setTimeout(() => fetchPage(1, query, false), 300);
    return () => clearTimeout(debounce);
  }, [query, open]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        readOnly={!open}
        onFocus={() => setOpen(true)}
        value={open ? query : selectedLabel}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        // className="w-full bg-slate-50  border border-slate-100 rounded px-5 py-3.5 text-sm font-bold"
         autoComplete="off"
required={required}
  className={`w-full bg-slate-50 rounded px-5 py-3.5 text-sm font-bold ${
    error
      ? "border border-red-500"
      : "border border-slate-100"
  }`}
      />
      {open && (
        <div className="absolute z-10 w-full bg-white border border-slate-100 rounded-2xl shadow-xl mt-1 max-h-72 overflow-y-auto">
          <div
            onClick={() => { onChange(""); setOpen(false); }}
            className="p-3 text-sm font-bold text-slate-400 hover:bg-slate-50 cursor-pointer"
          >
            {emptyOptionLabel}
          </div>
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="p-3 text-sm font-bold hover:bg-slate-50 cursor-pointer border-t border-slate-50"
            >
              {getLabel(opt)}
            </div>
          ))}
          {loading && <div className="p-3 text-sm text-slate-400">Loading...</div>}
          {!loading && hasMore && options.length > 0 && (
            <button
              type="button"
              onClick={() => fetchPage(page + 1, query, true)}
              className="w-full p-3 text-xs font-black text-[#132ea7] uppercase tracking-widest hover:bg-slate-50"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;