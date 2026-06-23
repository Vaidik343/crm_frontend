const Input = ({ label, type = "text", value, onChange, error, placeholder, required, disabled, name, rightIcon }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl transition-all duration-200 outline-none
            ${rightIcon ? "pr-10" : ""}
            ${error
              ? "border-red-500 ring-4 ring-red-500/10"
              : "border-slate-200 focus:border-[#e98937] focus:ring-4 focus:ring-[#e98937]/10"
            }
            ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:border-slate-300"}
          `}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default Input;