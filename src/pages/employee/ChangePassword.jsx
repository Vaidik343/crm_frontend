import { useState } from "react";
import { usePassword } from "../../context/PasswordContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { MdLock, MdVpnKey, MdShield, MdCheckCircle, MdInfoOutline } from "react-icons/md";

const ChangePassword = () => {
  const { changePassword } = usePassword();
  const [form, setForm]     = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("Authorization confirmation mismatch. Please verify access codes.");
      return;
    }
    try {
      setLoading(true);
      await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setSuccess("Operational access code updated successfully.");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "Protocol update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-xl">
        
        {/* Security Shield Header */}
        <div className="text-center mb-10">
           <div className="w-24 h-24 bg-[#132ea7] text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#132ea7]/30 border-4 border-white">
              <MdShield size={48} />
           </div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">Security <span className="text-[#132ea7]">Center</span></h2>
           <p className="text-slate-500 font-bold text-base uppercase tracking-widest">Update your operational access credentials</p>
        </div>

        <Alert type="danger" message={error} onClose={() => setError("")} />
        <Alert type="success" message={success} onClose={() => setSuccess("")} />

        <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            <div className="space-y-6">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-1 pt-6 text-[#132ea7]">
                     <MdVpnKey size={20} className="opacity-40" />
                  </div>
                  <Input
                    label="Current Access Code"
                    name="oldPassword"
                    type="password"
                    value={form.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                    className="pl-8"
                  />
               </div>

               <div className="relative pt-4">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-1 pt-10 text-[#132ea7]">
                     <MdLock size={20} className="opacity-40" />
                  </div>
                  <Input
                    label="New Secure Code"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    className="pl-8"
                  />
               </div>

               <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-1 pt-6 text-[#132ea7]">
                     <MdCheckCircle size={20} className="opacity-40" />
                  </div>
                  <Input
                    label="Confirm New Code"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Verify new password"
                    required
                    className="pl-8"
                  />
               </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
               <MdInfoOutline className="text-[#132ea7] mt-0.5" size={20} />
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                  "Use a combination of alphanumeric characters and special symbols for maximum security clearance strength."
               </p>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#132ea7]/20" 
              loading={loading}
            >
              Update Security Protocol
            </Button>
          </form>

          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-full -ml-24 -mb-24 opacity-50" />
        </div>

        <div className="mt-10 text-center">
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;