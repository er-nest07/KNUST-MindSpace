import { Link, useLocation } from "react-router";
import { MessageCircle, Home, Users, BookOpen, User, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#004D2C] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/feed" : "/"} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-lg">KNUST MindSpace</span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {user.role === 'student' && (
                <>
                  <Link
                    to="/feed"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/feed') 
                        ? 'border-b-2 border-[#FDB913]' 
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span>Feed</span>
                  </Link>
                  <Link
                    to="/conversations"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/conversations') 
                        ? 'border-b-2 border-[#FDB913]' 
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>
                  <Link
                    to="/counsellors"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/counsellors')
                        ? 'border-b-2 border-[#FDB913]'
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Counsellors</span>
                  </Link>
                  <Link
                    to="/programmes"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/programmes') 
                        ? 'border-b-2 border-[#FDB913]' 
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Programmes</span>
                  </Link>
                </>
              )}
              
              {user.role === 'counsellor' && (
                <>
                  <Link
                    to="/counsellor/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/counsellor/dashboard') 
                        ? 'border-b-2 border-[#FDB913]' 
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/feed"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/feed') 
                        ? 'border-b-2 border-[#FDB913]' 
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Community</span>
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'border-b-2 border-[#FDB913]'
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                  <Link
                    to="/feed"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/feed')
                        ? 'border-b-2 border-[#FDB913]'
                        : 'hover:bg-[#006B3F]'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Community</span>
                  </Link>
                </>
              )}
              
              <Link
                to="/crisis"
                className="flex items-center gap-2 px-3 py-2 bg-[#DC2626] hover:bg-[#b91c1c] rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Crisis Help</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile') 
                    ? 'border-b-2 border-[#FDB913]' 
                    : 'hover:bg-[#006B3F]'
                }`}
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-4">
              <Link
                to="/crisis"
                className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#b91c1c] rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Crisis Help</span>
              </Link>
              <Link
                to="/login"
                className="px-6 py-2 bg-[#006B3F] hover:bg-[#004D2C] rounded-lg transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-[#006B3F] px-4 py-2">
          <div className="flex items-center justify-around">
            {user.role === 'student' && (
              <>
                <Link to="/feed" className={`p-2 ${isActive('/feed') ? 'text-[#FDB913]' : ''}`}>
                  <Home className="w-6 h-6" />
                </Link>
                <Link to="/conversations" className={`p-2 ${isActive('/conversations') ? 'text-[#FDB913]' : ''}`}>
                  <MessageCircle className="w-6 h-6" />
                </Link>
                <Link to="/counsellors" className={`p-2 ${isActive('/counsellors') ? 'text-[#FDB913]' : ''}`}>
                  <Users className="w-6 h-6" />
                </Link>
                <Link to="/programmes" className={`p-2 ${isActive('/programmes') ? 'text-[#FDB913]' : ''}`}>
                  <BookOpen className="w-6 h-6" />
                </Link>
                <Link to="/profile" className={`p-2 ${isActive('/profile') ? 'text-[#FDB913]' : ''}`}>
                  <User className="w-6 h-6" />
                </Link>
              </>
            )}
            {user.role === 'counsellor' && (
              <>
                <Link to="/counsellor/dashboard" className={`p-2 ${isActive('/counsellor/dashboard') ? 'text-[#FDB913]' : ''}`}>
                  <Home className="w-6 h-6" />
                </Link>
                <Link to="/feed" className={`p-2 ${isActive('/feed') ? 'text-[#FDB913]' : ''}`}>
                  <Users className="w-6 h-6" />
                </Link>
                <Link to="/profile" className={`p-2 ${isActive('/profile') ? 'text-[#FDB913]' : ''}`}>
                  <User className="w-6 h-6" />
                </Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className={`p-2 ${isActive('/admin/dashboard') ? 'text-[#FDB913]' : ''}`}>
                  <ShieldCheck className="w-6 h-6" />
                </Link>
                <Link to="/feed" className={`p-2 ${isActive('/feed') ? 'text-[#FDB913]' : ''}`}>
                  <Users className="w-6 h-6" />
                </Link>
                <Link to="/profile" className={`p-2 ${isActive('/profile') ? 'text-[#FDB913]' : ''}`}>
                  <User className="w-6 h-6" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}