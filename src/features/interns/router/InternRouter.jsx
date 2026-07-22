// src/features/interns/router/InternRouter.jsx

import { Navigate, Route, Routes } from "react-router-dom";
import { useInternAuth } from "../hooks/useInternAuth";

// Layout
import InternLayout from "../../../components/layout/InternLayout";

// Public pages
import InternRegister from "../pages/public/InternRegister";
import InternStatus from "../pages/public/InternStatus";
import InternSetupPassword from "../pages/public/InternSetupPassword";
import InternLogin from "../pages/public/InternLogin";

// Intern pages
import InternDashboard from "../pages/public/InternDashboard";
import InternProject from "../pages/public/InternProject";
import InternTasks from "../pages/public/InternTasks";
import InternWorkLogs from "../pages/public/InternWorkLogs";
import InternProfile from "../pages/public/InternProfile";

// ── Guard ─────────────────────────────────────────────────────────────────────
// Mirrors ProtectedRoute.jsx but uses intern token instead of main auth context
const ProtectedInternRoute = ({ children }) => {
  const { isValid } = useInternAuth();
  if (!isValid) return <Navigate to="/intern/login" replace />;
  return children;
};

// ── Router ────────────────────────────────────────────────────────────────────
const InternRouter = () => {
  return (
    <Routes>

      {/* ── Public routes (no layout) ───────────────────────────────────────── */}
      <Route path="register"          element={<InternRegister />} />
      <Route path="status/:token"     element={<InternStatus />} />
      <Route path="setup-password/:token" element={<InternSetupPassword />} />
      <Route path="login"             element={<InternLogin />} />

      {/* ── Protected intern routes (InternLayout) ──────────────────────────── */}
      <Route
        element={
          <ProtectedInternRoute>
            <InternLayout />
          </ProtectedInternRoute>
        }
      >
        <Route path="dashboard"  element={<InternDashboard />} />
        <Route path="project"    element={<InternProject />} />
        <Route path="tasks"      element={<InternTasks />} />
        <Route path="worklogs"   element={<InternWorkLogs />} />
        <Route path="profile"    element={<InternProfile />} />
      </Route>

      {/* ── Fallback ────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/intern/login" replace />} />

    </Routes>
  );
};

export default InternRouter;