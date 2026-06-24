import { MdSearch, MdClose } from "react-icons/md";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search....",
  className = "",
}) => {
    return(
        <div className={`relative w-full md:w-95 min-w-90 ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <MdSearch  size={20}/>
            </div>

            <input  
             type="text"
             value={value}
             onChange={(e) => onChange(e.target.value)}
             placeholder={placeholder}
             className="w-full bg-white border border-slate-200 rounded pl-22 pr-10 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] transition-all shadow-sm"
            />
            {
                value && (
                    <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400  hover:text-slate-600 transition"
                    >

                        <MdClose  size={18}/>
                    </button>
                )
            }

        </div>
    )
};

export default SearchInput;