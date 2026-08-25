// src/components/common/HeaderLogo.jsx

import React from "react";
import logo from "../../assets/Bluebell-Logo.webp";
const HeaderLogo = ({ 
  title = "CRM", 
  logoClassName = "h-8 w-auto object-contain bg-white rounded-lg p-1 shrink-0 shadow-sm",
  titleClassName = "font-black text-white text-base uppercase tracking-tight",
  containerClassName = "flex items-center gap-2.5 shrink-0"
}) => {
  return (
    <div className={containerClassName}>
    <img src={logo} alt="Bluebell Logo" className={logoClassName} />
      {title && <span className={titleClassName}>{title}</span>}
    </div>
  );
};

export default HeaderLogo;
