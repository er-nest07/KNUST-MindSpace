import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Home, MessageCircle, Users, BookOpen, AlertCircle, User, Menu, X, ShieldCheck, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const role: string = (user as any)?.role ?? "student";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleSignOut = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/login");
  };

  const studentLinks = [
    { label: "Feed",        to: "/feed",          icon: Home },
    { label: "Messages",    to: "/conversations",  icon: MessageCircle },
    { label: "Counsellors", to: "/counsellors",    icon: Users },
    { label: "Programmes",  to: "/programmes",     icon: BookOpen },
  ];
  const counsellorLinks = [
    { label: "Dashboard",     to: "/counsellor/dashboard",      icon: ShieldCheck },
    { label: "Conversations", to: "/conversations",  icon: MessageCircle },
    { label: "Feed",          to: "/feed",                      icon: Home },
  ];
  const adminLinks = [
    { label: "Dashboard", to: "/admin/dashboard", icon: ShieldCheck },
    { label: "Feed",      to: "/feed",             icon: Home },
  ];

  const links =
    role === "admin" ? adminLinks :
    role === "counsellor" ? counsellorLinks :
    studentLinks;

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";
  const userEmail = user?.email ?? "";
  const displayName = (user as any)?.user_metadata?.display_name ?? userEmail.split("@")[0];

  return (
    <div className={`sticky top-0 z-50 transition-all duration-500 ease-in-out
      ${scrolled ? "px-4 pt-3" : "px-0 pt-0"}`}>
      <nav className={`transition-all duration-500 ease-in-out
        ${scrolled
          ? "backdrop-blur-md bg-white/75 border border-gray-200/70 shadow-lg rounded-2xl mx-auto max-w-5xl"
          : "bg-white border-b border-gray-100 shadow-sm w-full rounded-none"
        }`}>
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <Link to={user ? "/feed" : "/"} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#006B3F] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-base font-black leading-none">M</span>
              </div>
              <div className="leading-tight">
                <span className="font-black text-[#1A1A1A] text-base tracking-tight">MindSpace</span>
                <span className="block text-[10px] font-bold text-[#006B3F] tracking-widest uppercase -mt-0.5">KNUST</span>
              </div>
            </Link>

            {/* Desktop nav links */}
            {!isAuthLoading && user && (
              <div className="hidden md:flex items-center gap-1">
                {links.map(({ label, to, icon: Icon }) => (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                      ${isActive(to)
                        ? "bg-[#006B3F] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-[#006B3F]"
                      }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthLoading ? null : user ? (
                <>
                  {/* Crisis Help */}
                  <Link to="/crisis"
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200
                      ${isActive("/crisis") ? "bg-red-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Crisis Help
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative pl-2 border-l border-gray-200" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen((o) => !o)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-gray-100
                                 transition-colors group"
                      aria-label="Profile menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#006B3F] flex items-center justify-center
                                      text-white text-sm font-bold">
                        {userInitial}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200
                        ${profileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown */}
                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl
                                      shadow-xl border border-gray-100 overflow-hidden z-50">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-[#F0F9F4]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#006B3F] flex items-center
                                            justify-center text-white font-bold">
                              {userInitial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1A1A1A] text-sm truncate">{displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link to="/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700
                                       hover:bg-gray-50 hover:text-[#006B3F] transition-colors">
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link to="/settings"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700
                                       hover:bg-gray-50 hover:text-[#006B3F] transition-colors">
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 py-1">
                          <button onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500
                                       hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                    Log in
                  </Link>
                  <Link to="/register"
                    className="px-5 py-1.5 rounded-full text-sm font-bold bg-[#006B3F] text-white hover:bg-[#005a34] transition-colors shadow-sm">
                    Join Us
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className={`md:hidden border-t px-4 py-3 space-y-1
            ${scrolled ? "border-gray-200/50 bg-white/80 backdrop-blur-md rounded-b-2xl" : "border-gray-100 bg-white"}`}>
            {!isAuthLoading && user && links.map(({ label, to, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive(to) ? "bg-[#006B3F] text-white" : "text-gray-600 hover:bg-gray-50 hover:text-[#006B3F]"}`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {!isAuthLoading && user && (
              <Link to="/crisis" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white mt-2">
                <AlertCircle className="w-4 h-4" />
                Crisis Help
              </Link>
            )}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {isAuthLoading ? null : user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#006B3F] flex items-center justify-center text-white text-sm font-bold">
                      {userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{displayName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                  </div>
                  <button onClick={() => { setMenuOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 text-center">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#006B3F] text-white text-center">
                    Join Us
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}