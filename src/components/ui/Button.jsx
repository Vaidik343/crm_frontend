const Button = ({
  children,
  variant = "primary",
  size,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const variants = {
    primary: "bg-[#e98937] text-white hover:bg-[#d4792d] shadow-lg shadow-orange-500/20",
    secondary: "bg-[#0d6efd] text-white hover:bg-[#0b5ed7] shadow-lg shadow-blue-500/20",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    lg: "px-6 py-3.5 text-lg rounded-2xl",
    md: "px-4 py-2.5 rounded-xl",
  };

  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2";
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;