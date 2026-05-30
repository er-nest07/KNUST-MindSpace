import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function CounsellorOnly() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#E8F5EE] flex items-center justify-center text-[#004D2C]">
        Checking access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "counsellor" || !user.is_verified_counsellor) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
