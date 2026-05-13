const Select = ({label, options = [], value, onChange, error, required, disabled, name, placeholder}) => {
  return(
    <div className="mb-3">
      {label && (
        <label className="form-label fw-medium">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select ${error ? "is-invalid" : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
         
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}


      </select>
      {error && <div>{error}</div>}
    </div>
  );
}

export default Select;