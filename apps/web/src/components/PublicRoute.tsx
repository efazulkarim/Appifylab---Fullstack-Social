import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../features/auth/authQuery.ts";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { data: userResponse, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-dark dark:bg-black dark:text-white">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (userResponse?.data) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
}
