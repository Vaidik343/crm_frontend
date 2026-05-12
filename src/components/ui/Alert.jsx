const Alert = ({ type = "info", message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    success: "✓",
    danger:  "✗",
    warning: "⚠",
    info:    "ℹ",
  };

  return (
    <div className={`alert alert-${type} alert-dismissible d-flex align-items-center gap-2`} role="alert">
      <span>{iconMap[type]}</span>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="btn-close ms-auto" onClick={onClose} />
      )}
    </div>
  );
};

export default Alert;