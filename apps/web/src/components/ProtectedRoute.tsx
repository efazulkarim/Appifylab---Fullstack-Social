import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../features/auth/authQuery.ts";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: userResponse, isLoading, isError } = useAuthUser();

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-dark dark:bg-black dark:text-white">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5 fw-semibold text-secondary">Entering Buddy Script...</p>
      </div>
    );
  }

  if (isError || !userResponse?.data) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
