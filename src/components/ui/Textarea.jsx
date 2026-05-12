const Textarea = ({label, value, onChange, error, rows = 3, placeholder, required, disabled, name}) => {
  return (
      <div className="mb-3">
        {label && (
          <label className="form-label fw-medium">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        <textarea 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`form-select ${error ? "is-invalid" : ""}`}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
  );
}

export default Textarea;