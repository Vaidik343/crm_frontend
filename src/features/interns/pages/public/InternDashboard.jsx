// src/features/interns/pages/intern/InternDashboard.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import { useInternAuth } from "../../hooks/useInternAuth";
import {
  MdEdit,
  MdArrowForward,
  MdAssignmentLate,
  MdFolder,
  MdCheckCircleOutline,
} from "react-icons/md";
import { formatDate } from "../../../../utils/formatDate";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TechChip = ({ label }) => {
  if (!label) return null;
  return (
    <span className="inline-block bg-[#132ea7]/10 text-[#132ea7] text-[11px] font-bold px-3 py-1 rounded-lg">
      {label}
    </span>
  );
};

const TechSection = ({ title, items }) => {
  if (!items) return null;
  const list = Array.isArray(items)
    ? items
    : items.split(",").map((i) => i.trim()).filter(Boolean);

  if (list.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((tech, idx) => (
          <TechChip key={`${tech}-${idx}`} label={tech} />
        ))}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const InternDashboard = () => {
  const navigate = useNavigate();
  const { internName } = useInternAuth();
  const {
    profile,
    profileLoading,
    getMyProfile,
    project,
    projectLoading,
    getMyProject,
    tasks = [],
    tasksLoading,
    getTasks,
  } = useIntern();

  useEffect(() => {
    getMyProfile();
    getMyProject();
    if (getTasks) getTasks();
  }, []);

  // ── Calculate Progress & Remaining Days dynamically if dates exist ────────────
  const calculateProgress = () => {
    if (profile?.progress !== undefined) return profile.progress;
    if (!profile?.startDate || !profile?.endDate) return 75; // default matching mockup

    const start = new Date(profile.startDate).getTime();
    const end = new Date(profile.endDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const current = now - start;
    return Math.min(Math.round((current / total) * 100), 100);
  };

  const calculateRemainingDays = () => {
    if (profile?.remainingDays !== undefined) return profile.remainingDays;
    if (!profile?.endDate) return 8; // fallback to mockup value

    const end = new Date(profile.endDate).getTime();
    const now = new Date().getTime();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const progressPercent = calculateProgress();
  const daysRemaining = calculateRemainingDays();

  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-8">
      {/* ── Welcome Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Welcome back, {profile?.name || internName || "INTER34"} 👋
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Here is an overview of your active internship and project progress.
        </p>
      </div>

      {/* ── Top Overview Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. Intern Profile Overview Card (4 Cols on LG) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            {/* Header / Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#132ea7] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#132ea7]/20">
                {(profile?.name || internName || "I").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  {profile?.name || internName || "INTER34"}
                </h2>
                <span className="inline-block bg-[#132ea7]/10 text-[#132ea7] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-1">
                  {profile?.status || "ACTIVE INTERN"}
                </span>
              </div>
            </div>

            {/* Intern Attributes Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  DEGREE
                </p>
                <p className="font-bold text-slate-700 mt-0.5">
                  {profile?.degree || "Bachelor"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  COLLEGE
                </p>
                <p className="font-bold text-slate-700 mt-0.5">
                  {profile?.college || "GTU"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  START DATE
                </p>
                <p className="font-bold text-slate-700 mt-0.5">
                  {profile?.startDate ? formatDate(profile.startDate) : "01-07-2026"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  END DATE
                </p>
                <p className="font-bold text-slate-700 mt-0.5">
                  {profile?.endDate ? formatDate(profile.endDate) : "31-07-2026"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  MENTOR
                </p>
                <p className="font-bold text-[#132ea7] mt-0.5">
                  {project?.mentor?.name || profile?.mentor?.name || "Harsh"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  ID
                </p>
                <p className="font-bold text-slate-700 mt-0.5">
                  {profile?.display_id || "IN034230726594"}
                </p>
              </div>
            </div>
          </div>

          {/* Internship Progress Bar Section */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mb-1">
              Internship Progress
            </p>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-black text-[#132ea7]">
                {progressPercent}% Completed
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#132ea7] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Project Overview Card (7 Cols on LG) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            {/* Card Top Row */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  PROJECT OVERVIEW
                </p>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {project?.name || "LMS - Learning Management System"}
                </h2>
              </div>
              <button
                onClick={() => navigate("/intern/project")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shrink-0"
              >
                <MdEdit size={14} className="text-slate-500" /> Edit Project
              </button>
            </div>

            {/* Description */}
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
              {project?.description ||
                "A comprehensive platform designed to streamline student registration, course tracking, and resource management within an enterprise environment. Focused on high-clarity UX and real-time collaboration."}
            </p>

            {/* Tech Stack Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <TechSection
                title="LANGUAGES"
                items={project?.tech_details?.languages || "JavaScript (ES6+), TypeScript"}
              />
              <TechSection
                title="FRAMEWORKS"
                items={project?.tech_details?.frameworks || "React.js, Tailwind CSS"}
              />
              <TechSection
                title="DATABASE"
                items={project?.tech_details?.database || "MongoDB"}
              />
              <TechSection
                title="TOOLS"
                items={project?.tech_details?.others || "Node.js, Git/GitHub"}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent Tasks Section ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            Recent Tasks
          </h2>
          <button
            onClick={() => navigate("/intern/tasks")}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#132ea7] hover:underline"
          >
            View All Tasks <MdArrowForward size={14} />
          </button>
        </div>

        {/* Task List or Empty State */}
        {pendingTasks.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pendingTasks.slice(0, 4).map((task) => (
              <div
                key={task._id || task.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <MdCheckCircleOutline className="text-slate-300 shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{task.title}</p>
                    <p className="text-xs text-slate-400">
                      Due: {task.dueDate ? formatDate(task.dueDate) : "No date"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-50 text-amber-600">
                  {task.status || "In Progress"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Mockup Empty State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 text-slate-300">
              <MdAssignmentLate size={40} />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-2">
              You have no pending tasks assigned yet
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-md leading-relaxed mb-6">
              Once your mentor assigns a new task or milestone, it will appear here. For now, you can explore the board to see project backlogs.
            </p>
            <button
              onClick={() => navigate("/intern/tasks")}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black active:scale-95 transition shadow-sm"
            >
              View Task Board
            </button>
          </div>
        )}
      </div>

      {/* ── Dashboard Footer ──────────────────────────────────────────────── */}
      <footer className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <p>
          <span className="font-bold text-slate-600">Intern Portal</span> — © {new Date().getFullYear()} Intern Portal. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-600 transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-600 transition">
            Terms of Service
          </a>
          <a href="#" className="hover:text-slate-600 transition">
            Contact Support
          </a>
        </div>
      </footer>
    </div>
  );
};

export default InternDashboard;