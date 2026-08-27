import { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SearchInput from "../../components/ui/SearchInput";
import { formatDate } from "../../utils/formatDate";
import { MdAdd, MdDownload, MdDelete, MdVisibility, MdCampaign, MdEdit } from "react-icons/md";
import toast from "react-hot-toast";
import EventCreate from "./EventCreate";

// ─────────────────────────────────────────────
// CONSTANTS & BADGES
// ─────────────────────────────────────────────

const EVENT_TYPE_CONFIG = {
  birthday:  { label: "Birthday",    color: "bg-pink-100 text-pink-700",    emoji: "🎂" },
  promotion: { label: "Promotion",   color: "bg-amber-100 text-amber-700",  emoji: "🏆" },
  office:    { label: "Office",      color: "bg-blue-100 text-blue-700",    emoji: "🏢" },
  trip:      { label: "Trip",        color: "bg-green-100 text-green-700",  emoji: "✈️" },
  fun_game:  { label: "Fun & Games", color: "bg-purple-100 text-purple-700", emoji: "🎮" },
};

const EventTypeBadge = ({ type }) => {
  const cfg = EVENT_TYPE_CONFIG[type] || { label: type, color: "bg-slate-100 text-slate-600", emoji: "📅" };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────
// SEAMLESS CARD THUMBNAIL (No Black Lines)
// ─────────────────────────────────────────────

const CardThumbnail = ({ html, onClick }) => {
  return (
    <div
      className="relative w-full aspect-[8/5] overflow-hidden rounded-t-2xl bg-slate-900 cursor-pointer group select-none flex items-center justify-center"
      onClick={onClick}
    >
      {/* Container wrapper dynamically scaling 800x500 canvas to fit thumbnail area */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div
          className="origin-center flex items-center justify-center shrink-0 pointer-events-none"
          style={{
            width: "800px",
            height: "500px",
            transform: "scale(var(--thumb-scale, 0.4))",
          }}
          ref={(node) => {
            if (!node) return;
            const parent = node.parentElement;
            if (parent) {
              const scale = parent.clientWidth / 800;
              node.style.setProperty("--thumb-scale", scale);
            }
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[2px]">
        <span className="bg-white/95 text-slate-800 rounded-xl px-3.5 py-1.5 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transform translate-y-1 group-hover:translate-y-0 transition-all">
          <MdVisibility size={15} /> View Card
        </span>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────
// CARD PREVIEW MODAL
// ─────────────────────────────────────────────

const CardPreviewModal = ({ event, onClose, onExport, exporting }) => {
  if (!event) return null;
  return (
    <Modal show={!!event} onClose={onClose} title="Card Preview" size="lg">
      <div className="space-y-5">
        <div
          className="rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-slate-50"
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
            <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
              <p className="font-bold text-slate-800 text-xs truncate">{item.value}</p>
            </div>
          ))}
        </div>
        {event.message && (
          <div className="bg-[#132ea7] rounded-xl p-4 text-white">
            <p className="text-[9px] font-black text-white/60 uppercase tracking-wider mb-1">Message</p>
            <p className="text-xs leading-relaxed text-white/90">{event.message}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1 font-bold uppercase tracking-wider text-xs h-10">
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onExport(event.id, event.display_id)}
            loading={exporting}
            className="flex-[2] font-bold uppercase tracking-wider text-xs h-10"
          >
            <MdDownload size={16} className="mr-1.5" /> Download PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN ADMIN EVENTS COMPONENT
// ─────────────────────────────────────────────

const AdminEvents = () => {
  const {
    events, loading, page, limit, total, totalPages,
    setPage, getAllEvents, deleteEvent, exportPNG, announceEvent, updateEvent
  } = useEvent();

  const [showCreate,   setShowCreate]   = useState(false);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [exporting,    setExporting]    = useState(false);
  const [alert,        setAlert]        = useState({ type: "", message: "" });
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [announcing,   setAnnouncing]   = useState(null);

  const [editTarget, setEditTarget] = useState(null);
  const[editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

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

  // ── Save edit ──
  const handleEditSave = async () => {
    if(!editTarget)  return;

    try {
      setEditSaving(true);
      await updateEvent(editTarget.id, editForm);
      toast.success("Event update.");
      setEditTarget(null);
    } catch (error) {
      toast.error("Failed to update event.");
    } finally {
      setEditSaving(false)
    }
  }
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

  const handleAnnounce = async (event) => {
    try {
      setAnnouncing(event.id);
      await announceEvent(event.id);
      toast.success(`"${event.employee_name}" event announced to all employees!`);
    } catch {
      toast.error("Failed to announce event.");
    } finally {
      setAnnouncing(null);
    }
  };

  // ── Pagination ──
  const Pagination = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <button 
        disabled={page === 1} 
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-200 transition-all">
        Previous
      </button>
      <div className="flex items-center gap-1.5">
        {[...Array(totalPages)].map((_, i) => (
          <button 
            key={i + 1} 
            onClick={() => setPage(i + 1)}
            className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
              page === i + 1 ? "bg-[#132ea7] text-white shadow-md shadow-[#132ea7]/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}>
            {i + 1}
          </button>
        ))}
      </div>
      <button 
        disabled={page === totalPages} 
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-200 transition-all">
        Next
      </button>
    </div>
  );

  return (
    <div className="space-y-6 px-4 max-w-7xl mx-auto py-4">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Manage <span className="text-[#132ea7]">Events</span>
          </h2>
          <p className="text-slate-400 font-bold text-xs mt-0.5">Total Events: {total}</p>
        </div>

        <Button
          variant="primary"
          className="shadow-md shadow-[#132ea7]/20 px-6 rounded-xl h-11 font-black uppercase tracking-wider text-xs"
          onClick={() => setShowCreate(true)}
        >
          <MdAdd size={20} className="mr-1" /> Create Event
        </Button>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "",          label: "All"          },
            { value: "birthday",  label: "🎂 Birthday"  },
            { value: "promotion", label: "🏆 Promotion" },
            { value: "office",    label: "🏢 Office"    },
            { value: "trip",      label: "✈️ Trip"      },
            { value: "fun_game",  label: "🎮 Fun & Games"},
          ].map((opt) => (
            <button key={opt.value}
              onClick={() => { setPage(1); setTypeFilter(opt.value); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                typeFilter === opt.value
                  ? "bg-[#132ea7] text-white shadow-md shadow-[#132ea7]/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="w-full lg:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name..." />
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* ── 3-Card Grid Layout ── */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-slate-400 font-extrabold uppercase tracking-widest text-xs">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.filter(Boolean).map((event) => (
            <div 
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >

              {/* Card Banner Preview */}
              <CardThumbnail 
                html={event.card_html} 
                onClick={() => setViewTarget(event)} 
              />

              {/* Card Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Employee Name & Type Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-800 text-base leading-tight truncate" title={event.employee_name}>
                      {event.employee_name}
                    </h3>
                    <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">{event.display_id}</p>
                  </div>
                  <EventTypeBadge type={event.event_type} />
                </div>

                {/* Details Meta */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                    <p className="font-extrabold text-slate-700 text-xs mt-0.5">{formatDate(event.event_date)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Created By</p>
                    <p className="font-extrabold text-slate-700 text-xs mt-0.5 text-right truncate max-w-[100px]">{event.creator?.name || "—"}</p>
                  </div>
                </div>

                {/* Admin Action Row */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button 
                    onClick={() => setViewTarget(event)}
                    title="Preview"
                    className="flex-1 h-9 rounded-xl bg-slate-50 text-slate-600 font-bold flex items-center justify-center gap-1 text-xs hover:bg-slate-100 transition-all border border-slate-200/60">
                    <MdVisibility size={15} /> View
                  </button>

                  <button
                    onClick={ () => openEdit(event)}
                    title="Edit"
                    className="p-2 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center hover:bg-blue-100 transition-all border border-blue-200/50"
                  ></button>
                  <button 
                    onClick={() => handleExport(event.id, event.display_id)}
                    title="Download PNG"
                    className="p-2 w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center hover:bg-emerald-100 transition-all border border-emerald-200/50">
                    <MdDownload size={16} />
                  </button>

                  {!event.is_announced ? (
                    <button
                      onClick={() => handleAnnounce(event)}
                      disabled={announcing === event.id}
                      title="Announce to all employees"
                      className="p-2 w-9 h-9 rounded-xl bg-orange-50 text-[#e98937] font-bold flex items-center justify-center hover:bg-orange-100 transition-all border border-orange-200/50 disabled:opacity-50">
                      {announcing === event.id ? <Spinner size="xs" /> : <MdCampaign size={18} />}
                    </button>
                  ) : (
                    <span className="px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700 h-9 flex items-center">
                      Announced ✓
                    </span>
                  )}

                  <button 
                    onClick={() => setDeleteTarget(event)}
                    title="Delete Event"
                    className="p-2 w-9 h-9 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center hover:bg-red-100 transition-all border border-red-200/50">
                    <MdDelete size={16} />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mt-6">
          <Pagination />
        </div>
      )}

      {/* ── Modals & Dialogs ── */}
      <Modal show={showCreate} onClose={() => setShowCreate(false)} title="Create Event" size="xl">
        <EventCreate onSuccess={handleCreated} onCancel={() => setShowCreate(false)} />
      </Modal>




      <CardPreviewModal
        event={viewTarget}
        onClose={() => setViewTarget(null)}
        onExport={handleExport}
        exporting={exporting}
      />

      <ConfirmDialog
        show={!!deleteTarget}
        message={`Delete event "${deleteTarget?.display_id}" for ${deleteTarget?.employee_name}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Edit modal */}
      <Modal show={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Event" size="md">

        {editTarget && (
          <div className="space-y-5">
            <label className="text-[11px] font-block text-slate-500 uppercase tracking-widest block ml-1">
              Name
            </label>

            <input
              type="text"
              value={editForm.employee_name}
              onChange={(e) => setEditForm((prev) => ({...prev, employee_name: e.target.value}))}

              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus-ring-4 focus:ring-[#132ea7]"
            />
          </div>
        )}


      </Modal>
    </div>
  );
};

export default AdminEvents;