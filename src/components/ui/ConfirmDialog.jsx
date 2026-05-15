import React from 'react';
import Modal from "./Modal";
import Button from "./Button";
import { MdWarningAmber } from "react-icons/md";

const ConfirmDialog = ({ show, message = "Are you sure?", onConfirm, onCancel, loading = false }) => {
  return (
    <Modal show={show} onClose={onCancel} title="Confirm Action" size="sm">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <MdWarningAmber size={32} />
        </div>
        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            className="flex-1" 
            onClick={onConfirm} 
            loading={loading}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;