import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({ show, message = "Are you sure?", onConfirm, onCancel, loading = false }) => {
  return (
    <Modal show={show} onClose={onCancel} title="Confirm Action" size="sm">
      <p className="mb-4">{message}</p>
      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;