import { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatDate } from "../../utils/formatDate";
import { MdVisibility, MdDownload } from "react-icons/md";
import toast from "react-hot-toast";

const EVENT_TYPE_CONFIG = {
  birthday:  { label: "Birthday",    color: "bg-pink-100 text-pink-700",     emoji: "🎂" },
  promotion: { label: "Promotion",   color: "bg-amber-100 text-amber-700",   emoji: "🏆" },
  office:    { label: "Office",      color: "bg-blue-100 text-blue-700",     emoji: "🏢" },
  trip:      { label: "Trip",        color: "bg-green-100 text-green-700",   emoji: "✈️" },
  fun_game:  { label: "Fun & Games", color: "bg-purple-100 text-purple-700", emoji: "🎮" },
};

const EventTypeBadge = ({ type }) => {
  const cfg = EVENT_TYPE_CONFIG[type] || { label: type, color: "bg-slate-100 text-slate-600", emoji: "📅" };
  return (
    <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

const Events = () => {
  const {
    events, loading, page, limit, total, totalPages,
    setPage, getEmployeeEvents, exportPNG,
  } = useEvent();

  const [viewTarget,  setViewTarget]  = useState(null);
  const [typeFilter,  setTypeFilter]  = useState("");
  const [exporting,   setExporting]   = useState(false);

  useEffect(() => {
    getEmployeeEvents(page, limit, { event_type: typeFilter });
  }, [page, typeFilter]);

  const handleExport = async (id, displayId) => {
    try {
      setExporting(true);
      await exportPNG(id, displayId);
      toast.success("PNG downloaded!");
    } catch {
      toast.error("Failed to download.");
    } finally {
      setExporting(false);
    }
  };

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

      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 uppercase">
            Company <span className="text-[#132ea7]">Events</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">Total: {total}</p>
        </div>

        {/* Filters */}
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
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                typeFilter === opt.value
                  ? "bg-[#132ea7] text-white shadow-lg shadow-[#132ea7]/20"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No events yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.filter(Boolean).map((event) => (
            <div key={event.id}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden group hover:shadow-slate-300/50 transition-all">

              {/* Card Preview Thumbnail */}
              <div
                className="h-48 overflow-hidden relative cursor-pointer"
                onClick={() => setViewTarget(event)}
              >
                <div
                  className="scale-[0.6] origin-top-left w-[167%] h-[167%] pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: event.card_html }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all bg-white rounded-xl px-4 py-2 font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <MdVisibility size={14} /> View Card
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-slate-800 text-base">{event.employee_name}</p>
                    <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5">{event.display_id}</p>
                  </div>
                  <EventTypeBadge type={event.event_type} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                    <p className="font-black text-slate-700 text-sm">{formatDate(event.event_date)}</p>
                  </div>
                  {event.mode === "ai" && (
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700">
                      ✨ AI
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setViewTarget(event)}
                    className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-[#132ea7]/10 hover:text-[#132ea7] transition-all">
                    <MdVisibility size={14} /> View
                  </button>
                  <button onClick={() => handleExport(event.id, event.display_id)}
                    className="flex-1 h-10 rounded-xl bg-green-50 text-green-600 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-green-100 transition-all">
                    <MdDownload size={14} /> PNG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="bg-white rounded-[2rem] border border-slate-100">
          <Pagination />
        </div>
      )}

      {/* View Modal */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Event Card" size="lg">
        {viewTarget && (
          <div className="space-y-6">
            <div
              className="rounded-2xl overflow-hidden shadow-xl"
              dangerouslySetInnerHTML={{ __html: viewTarget.card_html }}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Employee",   value: viewTarget.employee_name },
                { label: "Event Type", value: EVENT_TYPE_CONFIG[viewTarget.event_type]?.label },
                { label: "Event Date", value: formatDate(viewTarget.event_date) },
                { label: "Created By", value: viewTarget.creator?.name || "—" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-black text-slate-700 text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            {viewTarget.message && (
              <div className="bg-[#132ea7] rounded-2xl p-5 text-white">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Message</p>
                <p className="text-sm leading-relaxed opacity-90">{viewTarget.message}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setViewTarget(null)}
                className="flex-1 font-black uppercase tracking-widest text-xs">
                Close
              </Button>
              <Button variant="primary"
                onClick={() => handleExport(viewTarget.id, viewTarget.display_id)}
                loading={exporting}
                className="flex-[2] font-black uppercase tracking-widest text-xs">
                <MdDownload size={16} className="mr-1" /> Download PNG
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Events;