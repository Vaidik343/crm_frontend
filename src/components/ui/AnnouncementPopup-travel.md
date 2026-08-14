import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnnouncement } from "../../context/AnnouncementContext";
import { MdClose, MdOpenInNew } from "react-icons/md";

const EVENT_TYPE_CONFIG = {
  birthday:  { label: "Birthday",    emoji: "🎂", color: "from-purple-500 to-pink-500"   },
  promotion: { label: "Promotion",   emoji: "🏆", color: "from-amber-500 to-orange-500"  },
  office:    { label: "Office",      emoji: "🏢", color: "from-blue-500 to-cyan-500"     },
  trip:      { label: "Trip",        emoji: "✈️", color: "from-green-500 to-teal-500"    },
  fun_game:  { label: "Fun & Games", emoji: "🎮", color: "from-violet-500 to-purple-500" },
};

const AnnouncementPopup = ({ isEmployee = true }) => {
  const { announcement, dismissAnnouncement } = useAnnouncement();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!announcement) return;

    // Total animation duration is 6 seconds.
    // Auto-dismiss from React context after the animation finishes offscreen.
    const timer = setTimeout(() => {
      dismissAnnouncement();
    }, 6000);

    return () => clearTimeout(timer);
  }, [announcement, dismissAnnouncement]);

  if (!announcement) return null;

  const cfg = EVENT_TYPE_CONFIG[announcement.event_type] || {
    label: "Event", emoji: "📅", color: "from-[#132ea7] to-blue-500",
  };

  const handleDismiss = () => {
    dismissAnnouncement();
  };

  const handleViewEvents = () => {
    dismissAnnouncement();
    navigate(isEmployee ? "/employee/events" : "/admin/events");
  };

  return (
    <>
      {/* Dynamic Keyframe Animation Styles */}
      <style>{`
        @keyframes flyAcross {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          12% {
            transform: translateX(0);
            opacity: 1;
          }
          75% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100vw);
            opacity: 0;
          }
        }

        .animate-fly-across {
          animation: flyAcross 6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .animate-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`pointer-events-auto animate-fly-across ${
            isPaused ? "animate-paused" : ""
          }`}
          style={{
            width: "500px",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-slate-100 flex flex-col">
            {/* Top color strip */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.color}`} />

            {/* Horizontal Rectangular Content */}
            <div className="flex items-center justify-between p-3.5 gap-3">
              {/* Event Badge */}
              <div
                className={`shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${cfg.color} text-white flex flex-col items-center justify-center min-w-[65px]`}
              >
                <span className="text-2xl">{cfg.emoji}</span>
                <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 opacity-90 leading-none">
                  {cfg.label}
                </span>
              </div>

              {/* Text Info & Preview */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">
                  Announcement • <span className="text-slate-800">{announcement.employee_name}</span>
                </span>

                {announcement.message && (
                  <p className="text-xs text-slate-600 font-medium truncate leading-tight mt-0.5">
                    {announcement.message}
                  </p>
                )}

                {/* Scaled Preview Frame */}
                <div className="h-7 w-full overflow-hidden rounded bg-slate-50 relative mt-1 border border-slate-100">
                  <div
                    style={{
                      transform: "scale(0.18)",
                      transformOrigin: "top left",
                      width: "600px",
                      height: "300px",
                      pointerEvents: "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: announcement.card_html }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                <button
                  onClick={handleViewEvents}
                  className={`h-8 px-3 rounded-lg bg-gradient-to-r ${cfg.color} text-white font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 hover:shadow-md transition-all`}
                >
                  <MdOpenInNew size={13} /> View
                </button>

                <button
                  onClick={handleDismiss}
                  className="h-7 px-3 rounded-lg bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px] hover:bg-slate-200 transition-all flex items-center justify-center gap-1"
                >
                  <MdClose size={12} /> Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementPopup;