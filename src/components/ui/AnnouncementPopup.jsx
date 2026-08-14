import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnnouncement } from "../../context/AnnouncementContext";
import { MdClose, MdOpenInNew } from "react-icons/md";
import { FaBirthdayCake } from "react-icons/fa";
import { BsTrophyFill } from "react-icons/bs";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { motion, AnimatePresence } from "motion/react";  // ← latest import path

const EVENT_TYPE_CONFIG = {
  birthday:  { label: "Birthday",    emoji: <FaBirthdayCake size={15} />,       color: "from-purple-500 to-pink-500"   },
  promotion: { label: "Promotion",   emoji: <BsTrophyFill size={15} />,         color: "from-amber-500 to-orange-500"  },
  office:    { label: "Office",      emoji: <PiBuildingOfficeFill size={15} />, color: "from-blue-500 to-cyan-500"     },
  trip:      { label: "Trip",        emoji: "✈️",                               color: "from-green-500 to-teal-500"    },
  fun_game:  { label: "Fun & Games", emoji: "🎮",                               color: "from-violet-500 to-purple-500" },
};

const AnnouncementPopup = ({ isEmployee = true }) => {
  const { announcement, dismissAnnouncement } = useAnnouncement();
  const navigate = useNavigate();
  const [show, setShow]       = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!announcement) { setShow(false); return; }
    setShow(true);

    const timer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [announcement]);

  if (!announcement) return null;

  const cfg = EVENT_TYPE_CONFIG[announcement.event_type] || {
    label: "Event", emoji: "📅", color: "from-[#132ea7] to-blue-500",
  };

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => dismissAnnouncement(), 400);
  };

  const handleViewEvents = () => {
    setShow(false);
    setTimeout(() => {
      dismissAnnouncement();
      navigate(isEmployee ? "/employee/events" : "/admin/events");
    }, 400);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={announcement.id}
          className="fixed top-6 right-6 z-[9999]"
          style={{ width: "500px", maxWidth: "calc(100vw - 32px)" }}

          initial={{ x: "120%", opacity: 0 }}
          animate={{ x: 0,      opacity: 1 }}
          exit={{    x: "-120%", opacity: 0 }}

          transition={{
            type:      "spring",
            stiffness: 260,
            damping:   22,
            mass:      0.9,
          }}

          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-slate-100">

            {/* Top color strip */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.color}`} />

            {/* Content row */}
            <div className="flex items-center justify-between p-3.5 gap-3">

              {/* Event Badge */}
              <div className={`shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${cfg.color} text-white flex flex-col items-center justify-center min-w-[65px]`}>
                <span className="text-2xl">{cfg.emoji}</span>
                <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 opacity-90 leading-none">
                  {cfg.label}
                </span>
              </div>

              {/* Text + Preview */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">
                  Announcement •{" "}
                  <span className="text-slate-800">{announcement.employee_name}</span>
                </span>

                {announcement.message && (
                  <p className="text-xs text-slate-600 font-medium truncate leading-tight mt-0.5">
                    {announcement.message}
                  </p>
                )}

                {/* Scaled card preview */}
                <div className="h-7 w-full overflow-hidden rounded bg-slate-50 relative mt-1 border border-slate-100">
                  <div
                    style={{
                      transform:       "scale(0.18)",
                      transformOrigin: "top left",
                      width:           "600px",
                      height:          "300px",
                      pointerEvents:   "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: announcement.card_html }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{   scale: 0.96 }}
                  onClick={handleViewEvents}
                  className={`h-8 px-3 rounded-lg bg-gradient-to-r ${cfg.color} text-white font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 shadow-sm`}
                >
                  <MdOpenInNew size={13} /> View
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{   scale: 0.96 }}
                  onClick={handleDismiss}
                  className="h-7 px-3 rounded-lg bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px] flex items-center justify-center gap-1 hover:bg-slate-200 transition-colors"
                >
                  <MdClose size={12} /> Dismiss
                </motion.button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-slate-100">
              <motion.div
                className={`h-full bg-gradient-to-r ${cfg.color}`}
                initial={{ scaleX: 1,              originX: 0 }}
                animate={{ scaleX: isPaused ? 1 : 0 }}
                transition={{ duration: 6, ease: "linear" }}
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementPopup;