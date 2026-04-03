import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function AdminOnly() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#E8F5EE] flex items-center justify-center text-[#004D2C]">
        Checking admin access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
