import React from 'react';

const Select = ({ label, options = [], value, onChange, error, required, disabled, name, placeholder }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-white border rounded-xl transition-all duration-200 outline-none appearance-none
          ${error 
            ? "border-red-500 ring-4 ring-red-500/10" 
            : "border-slate-200 focus:border-[#e98937] focus:ring-4 focus:ring-[#e98937]/10"
          } 
          ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:border-slate-300"}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1.25rem',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default Select;