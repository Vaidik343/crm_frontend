import { useEffect, useState } from "react";
import { useTeam } from "../context/TeamContext";
import { useMember } from "../context/TeamMemberContext";
import { useUser } from "../context/UserContext"; // 
import { useProject } from "../context/ProjectContext";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  MdAdd, MdEdit, MdDelete, MdGroup, MdExpandMore, MdExpandLess,
  MdPersonAdd, MdPersonRemove, MdCheckCircle, MdCancel, MdBusiness
} from "react-icons/md";
import Select from "../components/ui/Select";

// ── Initial Forms ─────────────────────────────────────────────────────────────
const initialTeamForm = { name: "", project_id:null, description: "" };

const Teams = () => {
  const { teams, loading, createTeam, getAllTeams, updateTeam, deleteTeam } = useTeam();
  const { addTeamMember, removeMember } = useMember();

  const { users,  getAllUsers,} = useUser();
    const { projects, getAllProjects } = useProject();

    // project option
      const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
      console.log("🚀 ~ Teams ~ projectOptions:", projectOptions)



  // ── State ──────────────────────────────────────────────────────────────────
  const [expandedTeam, setExpandedTeam]   = useState(null); // which team is expanded
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [teamForm, setTeamForm]           = useState(initialTeamForm);
  const [teamErrors, setTeamErrors]       = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [alert, setAlert]                 = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  // Add member state
  const [addingToTeam, setAddingToTeam]   = useState(null); // team_id we're adding to
  const [selectedUsers, setSelectedUsers] = useState([]);   // user_ids to add
  const [addingMember, setAddingMember]   = useState(false);
  const [removingMember, setRemovingMember] = useState(null); // member id being removed

  useEffect(() => { 
    getAllTeams?.();
    getAllProjects?.() 
    getAllUsers?.()
}, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getMemberIds = (team) =>
    (team.TeamMembers || team.team_memberships || []).map((m) => m.user_id);

  const getAvailableEmployees = (team) => {
    const memberIds = getMemberIds(team);
    return users.filter((e) => !memberIds.includes(e.id));
  };

  // ── Team CRUD ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setTeamForm(initialTeamForm);
    setTeamErrors({});
    setShowTeamModal(true);
  };

  const openEdit = (team) => {
    setEditTarget(team);
    setTeamForm({ name: team.name || "", project_id: team.project_id || "", description: team.description || "" });
    setTeamErrors({});
    setShowTeamModal(true);
  };

  const validateTeam = () => {
    const errors = {};
    if (!teamForm.name.trim()) errors.name = "Team name is required";
    return errors;
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  setTeamForm((prev) => ({
    ...prev,
    [name]: value,
  }));

  // clear field error automatically
  if (teamErrors[name]) {
    setTeamErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    const errors = validateTeam();
    if (Object.keys(errors).length) { setTeamErrors(errors); return; }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateTeam(teamForm, editTarget.id);
        setAlert({ type: "success", message: "Team updated successfully" });
      } else {
        await createTeam(teamForm);
        setAlert({ type: "success", message: "Team created successfully" });
      }
      setShowTeamModal(false);
      setEditTarget(null);
      setTeamForm(initialTeamForm);
      await getAllTeams();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteTeam(confirmDelete.id);
      setAlert({ type: "success", message: "Team deleted" });
      await getAllTeams();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // ── Member Management ──────────────────────────────────────────────────────
  const openAddMember = (team) => {
    setAddingToTeam(team);
    setSelectedUsers([]);
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!addingToTeam || selectedUsers.length === 0) return;
    try {
      setAddingMember(true);
      await addTeamMember({
        team_id: addingToTeam.id,
        members: selectedUsers.map((user_id) => ({ user_id })),
      });
      setAlert({ type: "success", message: `${selectedUsers.length} member(s) added` });
      setAddingToTeam(null);
      setSelectedUsers([]);
      await getAllTeams();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Failed to add members" });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    try {
      setRemovingMember(memberId);
      await removeMember(memberId);
      setAlert({ type: "success", message: `${memberName} removed from team` });
      await getAllTeams();
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Failed to remove member" });
    } finally {
      setRemovingMember(null);
    }
  };

  if (loading && !teams.length) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Loading teams...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
            TEAM <span className="text-[#132ea7]">Management</span>
          </h2>
          <p className="text-slate-500 font-bold text-base">
            {teams.length} team{teams.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          variant="primary"
          className="shadow-lg shadow-[#132ea7]/20 px-6 rounded font-black uppercase tracking-widest text-sm h-[52px]"
          onClick={openCreate}
        >
          <MdAdd size={20} className="mr-1" /> Create Team
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-16 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <MdGroup size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">No teams created yet</p>
          <p className="text-slate-300 font-medium mt-2">Create your first team to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => {
            const members = team.TeamMembers || team.team_memberships || [];
            const isExpanded = expandedTeam === team.id;
            const availableEmps = getAvailableEmployees(team);

            return (
              <div
                key={team.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden"
              >
                {/* Team Header Row */}
                <div className="flex items-center justify-between px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-xl">
                      {team.name?.charAt(0) || <MdBusiness />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-800">{team.name}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          team.is_active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}>
                          {team.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {team.description && (
                        <p className="text-sm font-medium text-slate-400 mt-1">{team.description}</p>
                      )}
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                        {members.length} member{members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
                      onClick={() => openEdit(team)}
                      title="Edit Team"
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      onClick={() => setConfirmDelete(team)}
                      title="Delete Team"
                    >
                      <MdDelete size={20} />
                    </button>
                    <button
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-[#132ea7] hover:bg-[#132ea7]/10 transition-all"
                      onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Members Section */}
                {isExpanded && (
                  <div className="border-t border-slate-50 px-8 py-6 space-y-6">

                    {/* Member List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                          Team Members ({members.length})
                        </h4>
                        <button
                          className="flex items-center gap-2 text-xs font-black text-[#132ea7] uppercase tracking-widest hover:bg-[#132ea7]/10 px-3 py-1.5 rounded-xl transition-all"
                          onClick={() => openAddMember(addingToTeam?.id === team.id ? null : team)}
                        >
                          <MdPersonAdd size={16} />
                          Add Members
                        </button>
                      </div>

                      {members.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <MdGroup size={28} className="text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No members yet</p>
                          <p className="text-slate-300 text-xs mt-1">Click "Add Members" to get started</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {members.map((m) => {
                            const user = m.user || m.User;
                            return (
                              <div
                                key={m.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-[#132ea7]/10 text-[#132ea7] flex items-center justify-center font-black text-sm">
                                    {user?.name?.charAt(0) || "?"}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-700">{user?.name || "Unknown"}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {user?.employee_id || ""}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                  onClick={() => handleRemoveMember(m.id, user?.name)}
                                  disabled={removingMember === m.id}
                                  title="Remove Member"
                                >
                                  {removingMember === m.id
                                    ? <Spinner size="xs" />
                                    : <MdPersonRemove size={18} />
                                  }
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Add Member Panel (inline) */}
                    {addingToTeam?.id === team.id && (
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                          Select Employees to Add
                        </h4>

                        {availableEmps.length === 0 ? (
                          <p className="text-slate-400 font-medium text-sm text-center py-4">
                            All employees are already in this team
                          </p>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                              {availableEmps.map((emp) => {
                                const isSelected = selectedUsers.includes(emp.id);
                                return (
                                  <button
                                    key={emp.id}
                                    onClick={() => toggleSelectUser(emp.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                      isSelected
                                        ? "bg-[#132ea7] border-[#132ea7] text-white"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-[#132ea7]/30"
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
                                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-[#132ea7]"
                                    }`}>
                                      {emp.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-slate-700"}`}>
                                        {emp.name}
                                      </p>
                                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                                        {emp.employee_id}
                                      </p>
                                    </div>
                                    {isSelected && <MdCheckCircle size={18} className="ml-auto flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {selectedUsers.length} selected
                              </p>
                              <div className="flex gap-3">
                                <button
                                  className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-all"
                                  onClick={() => { setAddingToTeam(null); setSelectedUsers([]); }}
                                >
                                  Cancel
                                </button>
                                <Button
                                  variant="primary"
                                  className="px-5 py-2 text-xs font-black uppercase tracking-widest h-auto"
                                  onClick={handleAddMembers}
                                  loading={addingMember}
                                  disabled={selectedUsers.length === 0}
                                >
                                  Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Team Modal */}
      <Modal
        show={showTeamModal}
        onClose={() => { setShowTeamModal(false); setEditTarget(null); setTeamForm(initialTeamForm); }}
        title={editTarget ? "Edit Team" : "Create New Team"}
        size="md"
      >
        <form onSubmit={handleTeamSubmit} noValidate className="space-y-6">
          <Input
            label="Team Name"
            name="name"
            value={teamForm.name}
            onChange={handleChange}
           
            placeholder="e.g. TechRetail Mobile"
            required
          />

          <div className="md:col-span-2">
              <Select label="Project" name="project_id" value={teamForm.project_id}
 onChange={handleChange}
                          options={projectOptions}
                error={teamErrors.project_id} placeholder="Select associated project..."  />
            </div>

          <Textarea
            label="Description"
            name="description"
            value={teamForm.description}
           onChange={handleChange}
            placeholder="Brief description of what this team works on..."
            rows={3}
          />
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button
              variant="ghost"
              className="flex-1 font-black uppercase tracking-widest text-sm"
              onClick={() => { setShowTeamModal(false); setEditTarget(null); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-[2] h-14 shadow-xl shadow-[#132ea7]/20 font-black uppercase tracking-[0.2em] text-sm"
              loading={submitting}
            >
              {editTarget ? "Update Team" : "Create Team"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        show={!!confirmDelete}
        message={`Delete team "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteTeam}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Teams;
