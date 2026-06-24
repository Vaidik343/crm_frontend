import React from 'react';

const Textarea = ({ label, value, onChange, error, rows = 3, placeholder, required, disabled, name }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full max-h-[50dvh]  px-4 py-3 bg-white border rounded-2xl transition-all duration-200 outline-none resize-none
          ${error 
            ? "border-red-500 ring-4 ring-red-500/10" 
            : "border-slate-200 focus:border-[#e98937] focus:ring-4 focus:ring-[#e98937]/10"
          } 
          ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:border-slate-300"}
        `}
      />
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;