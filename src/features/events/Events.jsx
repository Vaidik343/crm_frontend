import { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatDate } from "../../utils/formatDate";
import { MdVisibility, MdDownload } from "react-icons/md";
import toast from "react-hot-toast";

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
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// Seamless Card Preview Container (No Black Bars)
const CardThumbnail = ({ html, onClick }) => {
  return (
    <div 
      className="relative w-full aspect-[16/9] overflow-hidden rounded-t-2xl bg-slate-50 cursor-pointer group select-none"
      onClick={onClick}
    >
      {/* Container wrapper scaling HTML to fill 100% space without letterboxing */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        <div 
          className="w-[140%] h-[140%] origin-top-left scale-[0.714] shrink-0 pointer-events-none [&>*]:w-full [&>*]:h-full [&>*]:object-cover [&>*]:rounded-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Modern Gradient Hover Overlay */}
      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[1px]">
        <span className="bg-white/95 text-slate-800 rounded-xl px-3.5 py-1.5 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transform translate-y-1 group-hover:translate-y-0 transition-all">
          <MdVisibility size={15} /> View Card
        </span>
      </div>
    </div>
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
    <div className={`flex items-center justify-between px-6 py-4 ${!compact ? "border-t border-slate-100" : ""}`}>
      <button 
        disabled={page === 1} 
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-200 transition-all">
        {compact ? "Prev" : "Previous"}
      </button>
      {compact ? (
        <span className="text-xs font-bold text-slate-500">{page} / {totalPages}</span>
      ) : (
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
      )}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Company <span className="text-[#132ea7]">Events</span>
          </h2>
          <p className="text-slate-400 font-bold text-xs mt-0.5">Total Events: {total}</p>
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
            <button 
              key={opt.value}
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
      </div>

      {/* 3 Cards Grid */}
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

              {/* Seamless Banner Thumbnail */}
              <CardThumbnail 
                html={event.card_html} 
                onClick={() => setViewTarget(event)} 
              />

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Employee Name & Type */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-800 text-base leading-tight truncate" title={event.employee_name}>
                      {event.employee_name}
                    </h3>
                    <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">{event.display_id}</p>
                  </div>
                  <EventTypeBadge type={event.event_type} />
                </div>

                {/* Date & Mode */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                    <p className="font-extrabold text-slate-700 text-xs mt-0.5">{formatDate(event.event_date)}</p>
                  </div>
                  {event.mode === "ai" && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                      ✨ AI
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => setViewTarget(event)}
                    className="flex-1 h-9 rounded-xl bg-slate-50 text-slate-600 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-slate-100 transition-all border border-slate-200/60">
                    <MdVisibility size={15} /> View
                  </button>
                  <button 
                    onClick={() => handleExport(event.id, event.display_id)}
                    className="flex-1 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-emerald-100 transition-all border border-emerald-200/50">
                    <MdDownload size={15} /> PNG
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

      {/* View Modal */}
      <Modal show={!!viewTarget} onClose={() => setViewTarget(null)} title="Event Card Details" size="lg">
        {viewTarget && (
          <div className="space-y-5">
            <div
              className="rounded-xl overflow-hidden  border-slate-200  flex items-center justify-center bg-slate-50"
              dangerouslySetInnerHTML={{ __html: viewTarget.card_html }}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Employee",   value: viewTarget.employee_name },
                { label: "Event Type", value: EVENT_TYPE_CONFIG[viewTarget.event_type]?.label || viewTarget.event_type },
                { label: "Event Date", value: formatDate(viewTarget.event_date) },
                { label: "Created By", value: viewTarget.creator?.name || "—" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="font-bold text-slate-800 text-xs truncate">{item.value}</p>
                </div>
              ))}
            </div>
            {viewTarget.message && (
              <div className="bg-[#132ea7] rounded-xl p-4 text-white">
                <p className="text-[9px] font-black text-white/60 uppercase tracking-wider mb-1">Message</p>
                <p className="text-xs leading-relaxed text-white/90">{viewTarget.message}</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" onClick={() => setViewTarget(null)}
                className="flex-1 font-bold uppercase tracking-wider text-xs h-10">
                Close
              </Button>
              <Button variant="primary"
                onClick={() => handleExport(viewTarget.id, viewTarget.display_id)}
                loading={exporting}
                className="flex-[2] font-bold uppercase tracking-wider text-xs h-10">
                <MdDownload size={16} className="mr-1.5" /> Download PNG
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Events;