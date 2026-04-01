import { Outlet, useLocation } from "react-router";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";

export default function Root() {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#E8F5EE]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}