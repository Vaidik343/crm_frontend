import { useState } from "react";
import { useEvent } from "../../context/EventContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner";

const EVENT_TYPES = [
  { value: "birthday",  label: "🎂 Birthday"   },
  { value: "promotion", label: "🏆 Promotion"  },
  { value: "office",    label: "🏢 Office"     },
  { value: "trip",      label: "✈️ Trip"       },
  { value: "fun_game",  label: "🎮 Fun & Games"},
];

const DESIGNS_BY_TYPE = {
  birthday:  ["birthday_1",  "birthday_2"],
  promotion: ["promotion_1", "promotion_2"],
  office:    ["office_1",    "office_2"],
  trip:      ["trip_1",      "trip_2"],
  fun_game:  ["fun_game_1",  "fun_game_2"],
};

const DESIGN_PREVIEWS = {
  birthday_1:  { label: "Purple Gradient", colors: ["#667eea", "#764ba2"] },
  birthday_2:  { label: "Golden Warm",     colors: ["#fff9f0", "#f59e0b"] },
  promotion_1: { label: "Dark Elegant",    colors: ["#0f2027", "#2c5364"] },
  promotion_2: { label: "Forest Green",    colors: ["#134e5e", "#71b280"] },
  office_1:    { label: "Navy Blue",       colors: ["#1a1a2e", "#0f3460"] },
  office_2:    { label: "Fresh Green",     colors: ["#f0fdf4", "#22c55e"] },
  trip_1:      { label: "Pink Vibrant",    colors: ["#f093fb", "#f5576c"] },
  trip_2:      { label: "Sky Blue",        colors: ["#4facfe", "#00f2fe"] },
  fun_game_1:  { label: "Golden Fun",      colors: ["#f7971e", "#ffd200"] },
  fun_game_2:  { label: "Lavender Pop",    colors: ["#a18cd1", "#fbc2eb"] },
};

const initialForm = {
  event_type:      "",
  mode:            "manual",
  employee_name:   "",
  employee_id:     "",
  message:         "",
  design_template: "",
  ai_prompt:       "",
  event_date:      "",
};

const EventCreate = ({ onSuccess, onCancel }) => {
  const { createEvent, previewAICard } = useEvent();

  const [form,          setForm]          = useState(initialForm);
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [aiGenerating,  setAiGenerating]  = useState(false);
  const [previewHTML,   setPreviewHTML]   = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Reset design when event type changes
    if (name === "event_type") {
      setForm((prev) => ({ ...prev, event_type: value, design_template: "" }));
      setPreviewHTML(null);
    }

    // Reset preview when mode changes
    if (name === "mode") {
      setPreviewHTML(null);
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.event_type)    errors.event_type    = "Event type is required.";
    if (!form.employee_name) errors.employee_name = "Employee name is required.";
    if (!form.event_date)    errors.event_date    = "Event date is required.";
    if (form.mode === "manual" && !form.design_template)
      errors.design_template = "Please select a design.";
    if (form.mode === "ai" && !form.ai_prompt)
      errors.ai_prompt = "AI prompt is required.";
    return errors;
  };

  const handleAIPreview = async () => {
    if (!form.event_type || !form.employee_name || !form.ai_prompt) {
      setFieldErrors({
        event_type:    !form.event_type    ? "Required" : "",
        employee_name: !form.employee_name ? "Required" : "",
        ai_prompt:     !form.ai_prompt     ? "Required" : "",
      });
      return;
    }
    try {
      setAiGenerating(true);
      const result = await previewAICard({
        event_type:    form.event_type,
        employee_name: form.employee_name,
        message:       form.message,
        ai_prompt:     form.ai_prompt,
      });
      setPreviewHTML(result.card_html);
    } catch {
      setFieldErrors((prev) => ({ ...prev, ai_prompt: "AI generation failed. Try again." }));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSubmitting(true);
      await createEvent({
        event_type:      form.event_type,
        mode:            form.mode,
        employee_name:   form.employee_name,
        employee_id:     form.employee_id || null,
        message:         form.message,
        design_template: form.mode === "manual" ? form.design_template : null,
        ai_prompt:       form.mode === "ai" ? form.ai_prompt : null,
        event_date:      form.event_date,
      });
      onSuccess();
    } catch (err) {
      setFieldErrors({ submit: err?.response?.data?.message || "Failed to create event." });
    } finally {
      setSubmitting(false);
    }
  };

  const designs = DESIGNS_BY_TYPE[form.event_type] || [];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Event Type */}
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
          Event Type <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => handleChange({ target: { name: "event_type", value: opt.value } })}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                form.event_type === opt.value
                  ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        {fieldErrors.event_type && (
          <p className="text-red-500 text-[10px] font-bold ml-1">{fieldErrors.event_type}</p>
        )}
      </div>

      {/* Mode */}
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
          Mode
        </label>
        <div className="flex gap-2">
          {[
            { value: "manual", label: "Manual" },
            { value: "ai",     label: "✨ AI Magic" },
          ].map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => handleChange({ target: { name: "mode", value: opt.value } })}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                form.mode === opt.value
                  ? opt.value === "ai"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Name + Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Employee Name"
          name="employee_name"
          value={form.employee_name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          error={fieldErrors.employee_name}
          required
        />
        <Input
          label="Event Date"
          name="event_date"
          type="date"
          value={form.event_date}
          onChange={handleChange}
          error={fieldErrors.event_date}
          required
        />
      </div>

      {/* Message */}
      <Textarea
        label="Message (Optional)"
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Write a custom message for the card..."
        rows={3}
      />

      {/* Manual Mode — Design Selector */}
      {form.mode === "manual" && form.event_type && (
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
            Select Design <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {designs.map((design) => {
              const preview = DESIGN_PREVIEWS[design];
              return (
                <button key={design} type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, design_template: design }));
                    if (fieldErrors.design_template)
                      setFieldErrors((prev) => ({ ...prev, design_template: "" }));
                  }}
                  className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    form.design_template === design
                      ? "border-[#132ea7] shadow-lg shadow-[#132ea7]/20"
                      : "border-transparent hover:border-slate-300"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preview.colors[0]}, ${preview.colors[1]})`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-xs uppercase tracking-widest drop-shadow">
                      {preview.label}
                    </span>
                  </div>
                  {form.design_template === design && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#132ea7] rounded-full" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {fieldErrors.design_template && (
            <p className="text-red-500 text-[10px] font-bold ml-1">{fieldErrors.design_template}</p>
          )}
        </div>
      )}

      {/* AI Mode */}
      {form.mode === "ai" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              label="AI Prompt"
              name="ai_prompt"
              value={form.ai_prompt}
              onChange={handleChange}
              placeholder="e.g. Create a vibrant birthday card with confetti theme for our senior developer John who loves coding and coffee..."
              rows={3}
              error={fieldErrors.ai_prompt}
              required
            />
          </div>
          <button type="button" onClick={handleAIPreview}
            disabled={aiGenerating || !form.event_type || !form.employee_name || !form.ai_prompt}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-purple-600/20">
            {aiGenerating ? (
              <><Spinner size="sm" /> Generating...</>
            ) : (
              "✨ Generate Preview"
            )}
          </button>
        </div>
      )}

      {/* Card Preview */}
      {previewHTML && (
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">
            Preview
          </label>
          <div
            className="rounded-2xl overflow-hidden shadow-xl border border-slate-100 scale-[0.85] origin-top"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>
      )}

      {fieldErrors.submit && (
        <p className="text-red-500 text-sm font-bold text-center">{fieldErrors.submit}</p>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-slate-50">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}
          className="flex-1 font-black uppercase tracking-widest text-sm">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}
          className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm">
          Create Event
        </Button>
      </div>
    </form>
  );
};

export default EventCreate;