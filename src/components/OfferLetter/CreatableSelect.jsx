const CreatableSelect = ({ label, options, value, onChange, onCreate, placeholder }) => {
  const [input, setInput]     = useState('');
  const [open, setOpen]       = useState(false);
  const [adding, setAdding]   = useState(false);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(input.toLowerCase())
  );
  const exactMatch = options.some(
    (o) => o.name.toLowerCase() === input.trim().toLowerCase()
  );
  const selectedLabel = options.find((o) => o.id === value)?.name || '';

  const handleSelect = (option) => {
    onChange(option.id, option.name);
    setInput(option.name);
    setOpen(false);
  };

  const handleAdd = async () => {
    if (!input.trim()) return;
    setAdding(true);
    try {
      const newOpt = await onCreate(input.trim());
      onChange(newOpt.id, newOpt.name);
      setInput(newOpt.name);
      setOpen(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-slate-500 mb-1.5">{label} <span className="text-red-400">*</span></label>
      <input
        value={open ? input : selectedLabel}
        onChange={(e) => { setInput(e.target.value); setOpen(true); onChange('', ''); }}
        onFocus={() => { setInput(selectedLabel); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#132ea7]"
      />
      {open && (
        <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onMouseDown={() => handleSelect(o)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#132ea7]/5 font-medium"
            >
              {o.name}
            </button>
          ))}
          {!exactMatch && input.trim() && (
            <button
              type="button"
              onMouseDown={handleAdd}
              disabled={adding}
              className="w-full text-left px-4 py-2.5 text-sm text-[#132ea7] font-black flex items-center gap-2 hover:bg-[#132ea7]/5 border-t border-slate-100"
            >
              <MdAdd size={14} /> {adding ? 'Adding...' : `Add "${input.trim()}"`}
            </button>
          )}
          {filtered.length === 0 && exactMatch && (
            <div className="px-4 py-2.5 text-xs text-slate-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
};
export default CreatableSelect