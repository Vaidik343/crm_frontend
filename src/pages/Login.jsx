import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from './../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from './../components/ui/Alert';


const Login = () => {
  const {login, loading } = useAuth();

  const [form, setForm] = useState({employee_id: "", password: ""});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const {name ,value} = e.target;
    setForm((prev) => ({
      ...prev, [name]: value
    }));

    // clear field error on change
    if(fieldErrors[name])
    {
      setFieldErrors((prev) => ({...prev, [name]: ""}));
    }
  };

  const validate = () => {
    const errors = {};
    if(!form.employee_id.trim()) error.employee_id = "Employee ID is required";
    if(!form.password.trim()) error.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validate();
    if(Object.keys(errors).length)
    {
      setFieldErrors(errors);
      return;
    }

    try {
      await login(form.employee_id.trim(), form.password);
    } catch (error) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center bg-light'>
      <div className='card border-0 shadow-sm' style={{width: "100%", maxWidth: 420}}>
        {/* Header */}
        <div className='card-body p-5'>
          <div className='text-center mb-4'>
            <div 
             className='d-inline-flex align-items-center justify-content-center bg-opacity-10 rounded-3 mb-3'
             style={{width: 56, height: 56, fontSize: 26}}
            >
                icon
            </div>
             <h4 className="fw-bold mb-1">CRM Login</h4>
            <p className="text-muted small mb-0">Sign in with your employee credentials</p>
          </div>

        {/* Error alert */}
          <Alert
           type='danger'
           message={error}
           onClose={() => setError("")}
           />

           {/* form */}
           <form onSubmit={handleSubmit} onValidate>
            <Input 
            label='Employee ID'
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            placeholder="e.g. EMP001"
            error={fieldErrors.employee_id}
            required
            />
             <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={fieldErrors.password}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-2"
              loading={loading}
            >
              Sign In
            </Button>
           </form>
        </div>
      </div>
        
    </div>
  )
}

export default Login