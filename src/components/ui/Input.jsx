const Input = ({ label, type = "text", value, onChange, error, placeholder, required, disabled, name }) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label fw-medium">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`form-control ${error ? "is-invalid" : ""}`}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Input;