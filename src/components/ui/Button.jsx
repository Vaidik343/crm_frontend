const Button = ({
  children, 
  variant = "primary",
  size,
  loading = false,
  disable = false,
  onClick,
  type = "button",
  className = ""
}) => {
  const sizeClass = size === 'sm' ? "btn-sm" : size === 'lg' ? "btn-lg" : "";

  return(
    <button
     type={type}
     onClick={onClick}
     disabled={disable || loading}
     className={`btn btn-${variant} ${sizeClass} ${className}`}
    >
      {loading ? (
        <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        Loading...
        </>
      ) : (
        <>
        children
        </>
      )}
    </button>
  )
}

export default Button;