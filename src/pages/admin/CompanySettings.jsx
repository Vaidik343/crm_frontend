import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import {
  MdSettings,
  MdEdit,
  MdClose,
  MdCheck,
  MdAccessTime,
  MdCalendarToday,
  MdHourglassFull,
  MdInfoOutline,
  MdShield,
  MdWarning,
} from "react-icons/md";

const CompanySettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [form, setForm] = useState({
    office_start_time: "",
    full_day_notice_hours: "",
    half_day_notice_hours: "",
  });
  const [errors, setErrors] = useState({});

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.SETTINGS.GET);
      setSettings(data.settings);
    } catch {
      setAlert({ type: "danger", message: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // populate form when editing opens
  useEffect(() => {
    if (editing && settings) {
      setForm({
        office_start_time: settings.office_start_time?.slice(0, 5) || "",
        full_day_notice_hours: String(settings.full_day_notice_hours || ""),
        half_day_notice_hours: String(settings.half_day_notice_hours || ""),
      });
      setErrors({});
    }
  }, [editing, settings]);

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!form.office_start_time) {
      e.office_start_time = "Office start time is required.";
    } else if (!timeRegex.test(form.office_start_time)) {
      e.office_start_time = "Must be in HH:MM format (e.g. 09:00).";
    }

    if (!form.full_day_notice_hours) {
      e.full_day_notice_hours = "Full day notice hours is required.";
    } else if (
      !Number.isInteger(Number(form.full_day_notice_hours)) ||
      Number(form.full_day_notice_hours) < 1
    ) {
      e.full_day_notice_hours = "Must be a positive whole number.";
    }

    if (!form.half_day_notice_hours) {
      e.half_day_notice_hours = "Half day notice hours is required.";
    } else if (
      !Number.isInteger(Number(form.half_day_notice_hours)) ||
      Number(form.half_day_notice_hours) < 1
    ) {
      e.half_day_notice_hours = "Must be a positive whole number.";
    }

    if (
      form.full_day_notice_hours &&
      form.half_day_notice_hours &&
      Number(form.half_day_notice_hours) >= Number(form.full_day_notice_hours)
    ) {
      e.half_day_notice_hours = "Must be less than full day notice hours.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const { data } = await api.put(ENDPOINTS.SETTINGS.UPDATE, {
        office_start_time: form.office_start_time,
        full_day_notice_hours: Number(form.full_day_notice_hours),
        half_day_notice_hours: Number(form.half_day_notice_hours),
      });
      setSettings(data.settings);
      setEditing(false);
      setAlert({ type: "success", message: "Settings updated successfully." });
    } catch (err) {
      setAlert({
        type: "danger",
        message: err?.response?.data?.message || "Failed to update settings.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-[#132ea7]/10 focus:border-[#132ea7] ${
      err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`;
  const labelCls =
    "text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1 mb-1.5";
  const errCls = "text-red-500 text-[10px] font-bold uppercase ml-1 mt-1";

  // ── Render Loading ─────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
          Loading settings...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1800px] mx-auto space-y-6 px-3 sm:px-6 animate-in fade-in duration-700">
      
      {/* ── Header Banner Card ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center shrink-0 shadow-inner">
            <MdSettings size={26} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase">
              Company <span className="text-[#132ea7]">Settings</span>
            </h2>
            <p className="text-slate-500 font-bold text-xs sm:text-sm mt-0.5">
              Leave policy and office schedule configuration
            </p>
          </div>
        </div>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#132ea7] text-white font-black uppercase tracking-wider text-xs shadow-md shadow-[#132ea7]/20 hover:bg-[#0f2490] transition-all self-start sm:self-auto shrink-0"
          >
            <MdEdit size={18} /> Edit Settings
          </button>
        )}
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left/Main Settings Box (Spans 2 cols on Large displays) ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                  {editing ? "Edit Leave Policy" : "Leave Notice Policy"}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  {editing
                    ? "Modify office start time and mandatory notice hours"
                    : "Controls notice windows required before applying for leaves"}
                </p>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {editing ? "Edit Mode" : "Active Policy"}
              </span>
            </div>

            {/* View Mode */}
            {!editing && settings && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Office Start Time */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100/80 transition hover:border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                    <MdAccessTime size={22} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Office Start Time
                  </p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {settings.office_start_time?.slice(0, 5) || "—"}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                    24-hour standard format
                  </p>
                </div>

                {/* Full Day Notice */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100/80 transition hover:border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[#132ea7] flex items-center justify-center mb-4">
                    <MdCalendarToday size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Full Day Notice
                  </p>
                  <p className="text-3xl font-black text-[#132ea7] tracking-tight">
                    {settings.full_day_notice_hours}
                    <span className="text-sm font-bold text-slate-400 ml-1.5">hrs</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-2">
                    Prior to office start time
                  </p>
                </div>

                {/* Half Day Notice */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100/80 transition hover:border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center mb-4">
                    <MdHourglassFull size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Half Day Notice
                  </p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {settings.half_day_notice_hours}
                    <span className="text-sm font-bold text-slate-400 ml-1.5">hrs</span>
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-2">
                    Prior to office start time
                  </p>
                </div>

              </div>
            )}

            {/* Edit Mode Form */}
            {editing && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Office Start Time */}
                  <div>
                    <label className={labelCls}>
                      Office Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={form.office_start_time}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, office_start_time: e.target.value }));
                        if (errors.office_start_time)
                          setErrors((prev) => ({ ...prev, office_start_time: "" }));
                      }}
                      className={inputCls(errors.office_start_time)}
                    />
                    {errors.office_start_time && (
                      <p className={errCls}>{errors.office_start_time}</p>
                    )}
                  </div>

                  {/* Full Day Notice Hours */}
                  <div>
                    <label className={labelCls}>
                      Full Day Notice (hrs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.full_day_notice_hours}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, full_day_notice_hours: e.target.value }));
                        if (errors.full_day_notice_hours)
                          setErrors((prev) => ({ ...prev, full_day_notice_hours: "" }));
                      }}
                      placeholder="e.g. 36"
                      className={inputCls(errors.full_day_notice_hours)}
                    />
                    {errors.full_day_notice_hours && (
                      <p className={errCls}>{errors.full_day_notice_hours}</p>
                    )}
                  </div>

                  {/* Half Day Notice Hours */}
                  <div>
                    <label className={labelCls}>
                      Half Day Notice (hrs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.half_day_notice_hours}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, half_day_notice_hours: e.target.value }));
                        if (errors.half_day_notice_hours)
                          setErrors((prev) => ({ ...prev, half_day_notice_hours: "" }));
                      }}
                      placeholder="e.g. 16"
                      className={inputCls(errors.half_day_notice_hours)}
                    />
                    {errors.half_day_notice_hours && (
                      <p className={errCls}>{errors.half_day_notice_hours}</p>
                    )}
                  </div>

                </div>

                {/* Form Warning Callout */}
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-3">
                  <MdWarning className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs font-bold text-amber-800">
                    Changes made here apply immediately to all upcoming leave applications submitted by employees.
                  </p>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setErrors({});
                    }}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-xs hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <MdClose size={16} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl bg-[#132ea7] text-white font-black uppercase tracking-wider text-xs shadow-md shadow-[#132ea7]/20 hover:bg-[#0f2490] transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {submitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <MdCheck size={18} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Right Column: Policy Guide & Quick Info ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <MdInfoOutline size={18} />
              </div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                How Policy Rules Apply
              </h4>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Notice requirements are calculated relative to the start time of the requested leave date.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-1">
                  Full Day Request
                </p>
                <p className="text-xs font-bold text-slate-500">
                  Must be submitted at least{" "}
                  <span className="text-[#132ea7] font-black">
                    {settings?.full_day_notice_hours || "—"} hours
                  </span>{" "}
                  before <span className="text-slate-800 font-black">{settings?.office_start_time?.slice(0, 5) || "—"}</span> on the target date.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-1">
                  Half Day Request
                </p>
                <p className="text-xs font-bold text-slate-500">
                  Requires at least{" "}
                  <span className="text-[#132ea7] font-black">
                    {settings?.half_day_notice_hours || "—"} hours
                  </span>{" "}
                  notice prior to office start time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-start gap-3">
                <MdShield className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-[11px] font-black text-emerald-800 uppercase tracking-wide">
                    Emergency Exception
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5 leading-relaxed">
                    Emergency leave requests bypass all notice time restrictions and require direct approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanySettings;