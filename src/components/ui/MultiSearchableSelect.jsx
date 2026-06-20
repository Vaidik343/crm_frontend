import LocalSearchableSelect from "./LocalSearchableSelect";
import { MdClose } from "react-icons/md";

/**
 * MultiSearchableSelect
 * Wraps LocalSearchableSelect to support selecting multiple options.
 * Selected items render as removable chips above the picker.
 */
const MultiSearchableSelect = ({
  options = [],
  value = [],            // array of selected ids
  onChange,               // (newArray) => void
  getId = (o) => o.id,
  getLabel = (o) => o.name,
  getSearchText,
  placeholder = "Search...",
  noResultsLabel = "No matches",
}) => {
  const availableOptions = options.filter((o) => !value.includes(getId(o)));
  const selectedOptions = value
    .map((id) => options.find((o) => getId(o) === id))
    .filter(Boolean);

  const handleAdd = (id) => {
    if (id && !value.includes(id)) {
      onChange([...value, id]);
    }
  };

  const handleRemove = (id) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className="space-y-2">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((opt) => (
            <span
              key={getId(opt)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#132ea7]/10 text-[#132ea7] rounded-xl text-xs font-bold"
            >
              {getLabel(opt)}
              <button
                type="button"
                onClick={() => handleRemove(getId(opt))}
                className="hover:text-red-500 transition-colors"
              >
                <MdClose size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <LocalSearchableSelect
        options={availableOptions}
        value=""
        onChange={handleAdd}
        getId={getId}
        getLabel={getLabel}
        getSearchText={getSearchText}
        placeholder={placeholder}
        noResultsLabel={availableOptions.length === 0 ? "All employees added" : noResultsLabel}
      />
    </div>
  );
};

export default MultiSearchableSelect;