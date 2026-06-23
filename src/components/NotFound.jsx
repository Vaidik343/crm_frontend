import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const handleRedirect = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(
      isAdmin
        ? "/admin/dashboard"
        : "/employee/myDashboard"
    );
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ minHeight: "100vh" }}
    >
      <h1 className="display-1 fw-bold">404</h1>

      <h3 className="mb-3">Page Not Found</h3>

      <p className="text-muted mb-4">
        The page you are looking for does not exist or has been moved.
      </p>

      <button
        className="btn btn-primary"
        onClick={handleRedirect}
      >
        {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
      </button>
    </div>
  );
};

export default NotFound;