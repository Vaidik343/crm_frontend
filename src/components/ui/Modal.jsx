import React from 'react';
import { MdClose } from "react-icons/md";

const Modal = ({ show, onClose, title, children, size = "md" }) => {
  if (!show) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-50 shrink-0">
          <h3 className="text-xl font-bold text-slate-800  tracking-wide">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;