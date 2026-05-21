// MyTeams.jsx — employee sees only THEIR teams
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../../context/TeamContext";
import Spinner from "../../components/ui/Spinner";
import { MdGroup, MdArrowForward } from "react-icons/md";

const MyTeams = () => {
  const navigate = useNavigate();
  const { teams, loading, getAllTeams } = useTeam();
  const [myTeams, setMyTeams] = useState([]);

  useEffect(() => {
    getAllTeams?.();
  }, []);

  // Filter to only teams where current user is a member
  useEffect(() => {
    if (teams.length) {
      // Backend already filters teams based on user membership in listTeams
      setMyTeams(teams);
    }
  }, [teams]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading teams...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
          MY <span className="text-[#132ea7]">TEAMS</span>
        </h2>
        <p className="text-slate-500 font-bold text-base">Teams you belong to</p>
      </div>

      {myTeams.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-16 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <MdGroup size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">Not assigned to any teams yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTeams.map((team) => {
            const members = team.TeamMembers || team.team_memberships || [];
            return (
              <div
                key={team.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 hover:shadow-2xl hover:border-[#132ea7]/20 transition-all cursor-pointer group"
                onClick={() => navigate(`/employee/teams/${team.id}/dashboard`)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-xl group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                    {team.name?.charAt(0)}
                  </div>
                  <MdArrowForward size={24} className="text-slate-300 group-hover:text-[#132ea7] group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2">{team.name}</h3>
                {team.description && (
                  <p className="text-sm font-medium text-slate-400 mb-4 line-clamp-2">{team.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    team.is_active
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-slate-50 text-slate-400 border-slate-100"
                  }`}>
                    {team.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTeams;