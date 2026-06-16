import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from './../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from './../components/ui/Alert';
import loginBg from '../assets/login-bg.png';

import {
  MdAdminPanelSettings,
} from "react-icons/md";

const Login = () => {
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ employee_id: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev, [name]: value
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.employee_id.trim()) errors.employee_id = "Employee ID is required";
    if (!form.password.trim()) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login(form.employee_id.trim(), form.password);
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className='relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden font-sans'>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={loginBg} 
          alt="Background" 
          className="w-full h-full object-cover scale-105" 
          style={{ filter: 'brightness(0.4)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d6efd]/20 to-black/60" />
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#e98937] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#0d6efd] rounded-full blur-[120px] opacity-20" />

      {/* Login Card */}
      <div className='relative z-10 w-full max-w-[440px]'>
        <div className='backdrop-blur-xl bg-white/90 border border-white/20 shadow-2xl rounded-3xl overflow-hidden'>
          <div className='p-8 sm:p-12'>
            <div className='text-center mb-10'>
              <div 
                className='inline-flex items-center justify-center bg-[#e98937]/10 text-[#e98937] rounded-2xl mb-4 w-16 h-16 shadow-inner'
              >
                <MdAdminPanelSettings size={36} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in</p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-6">
                <Alert
                  type='danger'
                  message={error}
                  onClose={() => setError("")}
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input 
                label='Employee ID'
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                placeholder="EMP001"
                error={fieldErrors.employee_id}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder=""
                error={fieldErrors.password}
                required
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-12 text-lg shadow-xl shadow-[#e98937]/30"
                  loading={loading}
                >
                  Sign In to CRM
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                Protected by Secure Auth
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-white/50 text-xs tracking-wide">
          © 2026 CRM System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;