const Modal = ({ show, onClose, title, children, size = "" }) => {
  if (!show) return null;

  const sizeClass = 
    size === "lg" ? "modal-lg" : 
    size === "sm" ? "modal-sm" : 
    size === "xl" ? "modal-xl" : "";

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className={`modal-dialog modal-dialog-centered ${sizeClass}`} role="document">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-semibold">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      {/* clicking backdrop closes modal */}
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
};

export default Modal;