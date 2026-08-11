import { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SearchInput from "../../components/ui/SearchInput";
import { formatDate } from "../../utils/formatDate";
import { MdAdd, MdDownload, MdDelete, MdVisibility } from "react-icons/md";
import toast from "react-hot-toast";
import EventCreate from "./EventCreate";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const EVENT_TYPE_CONFIG = {
  birthday:  { label: "Birthday",   color: "bg-pink-100 text-pink-700",     emoji: "🎂" },
  promotion: { label: "Promotion",  color: "bg-amber-100 text-amber-700",   emoji: "🏆" },
  office:    { label: "Office",     color: "bg-blue-100 text-blue-700",     emoji: "🏢" },
  trip:      { label: "Trip",       color: "bg-green-100 text-green-700",   emoji: "✈️" },
  fun_game:  { label: "Fun & Games",color: "bg-purple-100 text-purple-700", emoji: "🎮" },
};

const EventTypeBadge = ({ type }) => {
  const cfg = EVENT_TYPE_CONFIG[type] || { label: type, color: "bg-slate-100 text-slate-600", emoji: "📅" };
  return (
    <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────
// CARD PREVIEW MODAL
// ─────────────────────────────────────────────

const CardPreviewModal = ({ event, onClose, onExport, exporting }) => {
  if (!event) return null;
  return (
    <Modal show={!!event} onClose={onClose} title="Card Preview" size="lg">
      <div className="space-y-6">
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          dangerouslySetInnerHTML={{ __html: event.card_html }}
        />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Employee",   value: event.employee_name },
            { label: "Event Type", value: EVENT_TYPE_CONFIG[event.event_type]?.label || event.event_type },
            { label: "Event Date", value: formatDate(event.event_date) },
            { label: "Mode",       value: event.mode === "ai" ? "AI Generated" : "Manual" },
            { label: "Created By", value: event.creator?.name || "—" },
            { label: "Display ID", value: event.display_id },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="font-black text-slate-700 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
        {event.message && (
          <div className="bg-[#132ea7] rounded-2xl p-5 text-white">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Message</p>
            <p className="text-sm leading-relaxed opacity-90">{event.message}</p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 font-black uppercase tracking-widest text-xs">
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onExport(event.id, event.display_id)}
            loading={exporting}
            className="flex-[2] font-black uppercase tracking-widest text-xs"
          >
            <MdDownload size={16} className="mr-1" /> Download PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const AdminEvents = () => {
  const {
    events, loading, page, limit, total, totalPages,
    setPage, getAllEvents, deleteEvent, exportPNG,
  } = useEvent();

  const [showCreate,    setShowCreate]    = useState(false);
  const [viewTarget,    setViewTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [exporting,     setExporting]     = useState(false);
  const [alert,         setAlert]         = useState({ type: "", message: "" });
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("");

  // ── Effects ──
  useEffect(() => {
    getAllEvents(page, limit, { event_type: typeFilter, search });
  }, [page, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      getAllEvents(1, limit, { event_type: typeFilter, search });
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  // ── Handlers ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteEvent(deleteTarget.id);
      toast.success("Event deleted.");
    } catch {
      toast.error("Failed to delete event.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleExport = async (id, displayId) => {
    try {
      setExporting(true);
      await exportPNG(id, displayId);
      toast.success("PNG downloaded!");
    } catch {
      toast.error("Failed to export PNG.");
    } finally {
      setExporting(false);
    }
  };

  const handleCreated = () => {
    setShowCreate(false);
    getAllEvents(1, limit, {});
    toast.success("Event created successfully!");
  };

  // ── Pagination ──
  const Pagination = ({ compact = false }) => (
    <div className={`flex items-center justify-between px-6 py-6 ${!compact ? "border-t border-slate-100" : ""}`}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">
        {compact ? "Prev" : "Previous"}
      </button>
      {compact ? (
        <span className="text-sm font-bold text-slate-500">{page} / {totalPages}</span>
      ) : (
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-[#132ea7] text-white" : "bg-slate-100 text-slate-700"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-50">
        Next
      </button>
    </div>
  );

  return (
    <div className="space-y-8 px-4 animate-in fade-in duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
              <span className="text-[#132ea7]">Events</span>
            </h2>
            <p className="text-slate-500 font-bold text-base">Total: {total}</p>
          </div>
          <Button
            variant="primary"
            className="shadow-lg shadow-[#132ea7]/20 px-8 rounded-xl h-[52px] font-black uppercase tracking-widest text-sm"
            onClick={() => setShowCreate(true)}
          >
            <MdAdd size={22} className="mr-1" /> Create Event
          </Button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "",          label: "All"        },
              { value: "birthday",  label: "🎂 Birthday"  },
              { value: "promotion", label: "🏆 Promotion" },
              { value: "office",    label: "🏢 Office"    },
              { value: "trip",      label: "✈️ Trip"      },
              { value: "fun_game",  label: "🎮 Fun & Games"},
            ].map((opt) => (
              <button key={opt.value}
                onClick={() => { setPage(1); setTypeFilter(opt.value); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  typeFilter === opt.value
                    ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name..." />
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* ── Desktop Table ── */}
      <div className="hidden md:block">
        <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200/50">
                  {["Display ID", "Employee", "Event Type", "Mode", "Event Date", "Created By", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-5 text-md font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <Spinner size="lg" />
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400 py-16 font-medium italic text-lg uppercase tracking-widest">
                      No events found.
                    </td>
                  </tr>
                ) : events.filter(Boolean).map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-[#132ea7]/10 text-[#132ea7] rounded-lg text-[11px] font-black uppercase tracking-widest font-mono">
                        {event.display_id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800">{event.employee_name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <EventTypeBadge type={event.event_type} />
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${
                        event.mode === "ai"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {event.mode === "ai" ? "✨ AI" : "Manual"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-slate-700 text-sm">{formatDate(event.event_date)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-600 text-sm">{event.creator?.name || "—"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewTarget(event)} title="Preview"
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all">
                          <MdVisibility size={20} />
                        </button>
                        <button onClick={() => handleExport(event.id, event.display_id)} title="Download PNG"
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all">
                          <MdDownload size={20} />
                        </button>
                        <button onClick={() => setDeleteTarget(event)} title="Delete"
                          className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination />}
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold">No events found.</div>
        ) : events.filter(Boolean).map((event) => (
          <div key={event.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-800">{event.employee_name}</p>
                <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">{event.display_id}</p>
              </div>
              <EventTypeBadge type={event.event_type} />
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Event Date", value: formatDate(event.event_date) },
                { label: "Mode",       value: event.mode === "ai" ? "✨ AI" : "Manual" },
                { label: "Created By", value: event.creator?.name || "—" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">{item.label}</span>
                  <span className="font-bold text-slate-700 text-xs">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setViewTarget(event)}
                className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                <MdVisibility size={16} /> View
              </button>
              <button onClick={() => handleExport(event.id, event.display_id)}
                className="flex-1 h-10 rounded-xl bg-green-50 text-green-600 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-green-100 transition-all">
                <MdDownload size={16} /> PNG
              </button>
              <button onClick={() => setDeleteTarget(event)}
                className="flex-1 h-10 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-red-100 transition-all">
                <MdDelete size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {totalPages > 1 && <Pagination compact />}
      </div>

      {/* ── Create Modal ── */}
      <Modal show={showCreate} onClose={() => setShowCreate(false)} title="Create Event" size="xl">
        <EventCreate onSuccess={handleCreated} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* ── Preview Modal ── */}
      <CardPreviewModal
        event={viewTarget}
        onClose={() => setViewTarget(null)}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        show={!!deleteTarget}
        message={`Delete event "${deleteTarget?.display_id}" for ${deleteTarget?.employee_name}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminEvents;