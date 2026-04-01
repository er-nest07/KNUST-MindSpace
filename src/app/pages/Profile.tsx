import { Link } from "react-router";
import { User, Shield, LogOut, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import AnonymousAvatar from "../components/shared/AnonymousAvatar";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#004D2C] mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-[#E8F5EE] mb-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
              {user.role === 'counsellor' ? (
                <span className="text-4xl">👤</span>
              ) : (
                <AnonymousAvatar seed={user.id} size={96} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-[#004D2C]">
                  {user.role === 'counsellor' 
                    ? user.display_name 
                    : user.visibility === 'anonymous' 
                    ? 'Anonymous Student' 
                    : user.visibility === 'pseudonym'
                    ? user.pseudonym
                    : user.display_name
                  }
                </h2>
                {user.is_verified_counsellor && <CounsellorBadge />}
              </div>
              
              {user.role === 'counsellor' && (
                <p className="text-gray-600 mb-2">{user.counsellor_title}</p>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                {user.role === 'student' && user.visibility === 'anonymous' && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#006B3F] px-3 py-1 rounded-full">
                    <Shield className="w-3 h-3" />
                    Fully Anonymous
                  </span>
                )}
                {user.role === 'student' && user.visibility === 'pseudonym' && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#006B3F] px-3 py-1 rounded-full">
                    <User className="w-3 h-3" />
                    Using Pseudonym
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Bio (counsellors only) */}
          {user.role === 'counsellor' && user.counsellor_bio && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-[#004D2C] mb-2">About</h3>
              <p className="text-gray-700">{user.counsellor_bio}</p>
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] mb-6">
          <h3 className="font-bold text-[#004D2C] mb-4">Account Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold text-[#004D2C]">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Account Type</span>
              <span className="font-semibold text-[#004D2C] capitalize">{user.role}</span>
            </div>
            {user.role === 'student' && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Visibility Setting</span>
                <span className="font-semibold text-[#004D2C] capitalize">{user.visibility}</span>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        {user.role === 'student' && (
          <div className="bg-white rounded-xl p-6 border-l-4 border-[#006B3F] mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#006B3F] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-[#004D2C] mb-1">Your Privacy is Protected</p>
                <p>
                  {user.visibility === 'anonymous' && 
                    "You're currently fully anonymous. Other students see you as 'Anonymous Student'. Only counsellors see a unique ID to provide care."
                  }
                  {user.visibility === 'pseudonym' && 
                    `You're using the pseudonym "${user.pseudonym}". Your real identity remains private.`
                  }
                  {user.visibility === 'identified' && 
                    "You've chosen to use your real identity. Other students can see your name on posts and comments."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Link to="/guidelines">
            <Button variant="outline" className="w-full justify-start text-left">
              <AlertCircle className="w-5 h-5 mr-3" />
              Community Guidelines
            </Button>
          </Link>
          
          <Link to="/crisis">
            <Button variant="outline" className="w-full justify-start text-left border-[#DC2626] text-[#DC2626] hover:bg-red-50">
              <AlertCircle className="w-5 h-5 mr-3" />
              Crisis Resources
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
