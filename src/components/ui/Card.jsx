const Card = ({title, subtitle, children, footer, className = ""}) => {
  return (
    <div className={`card shadow-sm border-0 ${className}`}>
      {(title || subtitle) && (
        <div className="card-header bg-white border-bottom">
          {title && <h5 className="card-title mb-0 fw-semibold">{title}</h5>}
          {subtitle && <p className="text-musted small mb-0 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer bg-white border-top">{footer}</div>}
    </div>
  );
};

export default Card;