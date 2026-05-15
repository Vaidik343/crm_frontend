import { useState } from "react";
import { usePassword } from "../../context/PasswordContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

const initialForm = {
  current_password: "",
  new_password:     "",
  confirm_password: "",
};

const ChangePassword = () => {
  const { changeOwnPassword, loading } = usePassword();

  const [form, setForm]               = useState(initialForm);
  console.log("🚀 ~ ChangePassword ~ form:", form)
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert]             = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.current_password)           errors.current_password = "Current password is required";
    if (!form.new_password)               errors.new_password     = "New password is required";
    if (form.new_password.length < 6)     errors.new_password     = "Minimum 6 characters";
    if (form.new_password === form.current_password) {
      errors.new_password = "New password must be different from current";
    }
    if (!form.confirm_password)           errors.confirm_password = "Please confirm your password";
    if (form.new_password !== form.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }
    return errors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      await changeOwnPassword({
        current_password: form.current_password,
        new_password:     form.new_password,
      });
      setAlert({ type: "success", message: "Password changed successfully" });
      setForm(initialForm);
    } catch (err) {
          console.log("🚀 ~ handleSubmit ~ err:", err)
      const msg = err?.response?.data?.message || "Failed to change password";
      setAlert({ type: "danger", message: msg });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">

            <h5 className="fw-bold mb-1">Change Password</h5>
            <p className="text-muted small mb-4">
              Update your password. You'll need your current password to continue.
            </p>

            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: "", message: "" })}
            />

            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Current Password"
                name="current_password"
                type="password"
                value={form.current_password}
                onChange={handleChange}
                error={fieldErrors.current_password}
                placeholder="Enter current password"
                required
              />
              <Input
                label="New Password"
                name="new_password"
                type="password"
                value={form.new_password}
                onChange={handleChange}
                error={fieldErrors.new_password}
                placeholder="Minimum 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                name="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={handleChange}
                error={fieldErrors.confirm_password}
                placeholder="Re-enter new password"
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-100 mt-2"
                loading={loading}
              >
                Change Password
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;