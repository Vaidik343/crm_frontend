import { useAnnouncement } from "../../context/AnnouncementContext";
import { MdCampaign } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const AnnouncementBell = ({ isEmployee = true }) => {
  const { unreadCount, clearUnread } = useAnnouncement();
  const navigate = useNavigate();

  const handleClick = () => {
    clearUnread();
    navigate(isEmployee ? "/employee/events" : "/admin/events");
  };

  return (
    <button onClick={handleClick}
      className="relative p-2 rounded-xl hover:bg-slate-100 transition-all">
      <MdCampaign size={24} className="text-slate-500" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e98937] rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-black">{unreadCount}</span>
        </span>
      )}
    </button>
  );
};

export default AnnouncementBell;