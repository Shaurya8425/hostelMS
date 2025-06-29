// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactElement;
  role: "ADMIN" | "STUDENT";
}) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || userRole !== role) {
    return <Navigate to='/' />;
  }

  return children;
}
