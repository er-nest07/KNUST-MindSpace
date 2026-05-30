import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User, Shield, LogOut, AlertCircle, Bookmark,
  BookOpen, ExternalLink, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import AnonymousAvatar from "../components/shared/AnonymousAvatar";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [activeTab, setActiveTab] = useState("profile");
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSavePhone = async () => {
  try {
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        phone_number: phone,
      })
      .eq("id", user.id);

    if (error) throw error;

    alert("Phone number saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save number");
    } finally {
      setSaving(false);
    }
  };

  const sendMessages = async () => {
  await fetch("http://localhost:3000/send-audit-message", {
    method: "POST",
  });

  alert("Messages sent!");
  };

  const loadSavedPosts = async () => {
    setSavedLoading(true);
    const ids = readSaved();
    if (ids.length === 0) {
      setSavedPosts([]);
      setSavedLoading(false);
      return;
    }
    const { data } = await supabase
      .from("posts")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });
    setSavedPosts((data ?? []) as DbPost[]);
    setSavedLoading(false);
  };

  const readSaved = (): string[] => {
  const saved = localStorage.getItem("savedPosts");
  return saved ? JSON.parse(saved) : [];
  };

  const removeSaved = (postId: string) => {
    const saved = readSaved().filter((id) => id !== postId);
    localStorage.setItem("savedPosts", JSON.stringify(saved));
  };

  useEffect(() => {
    if (activeTab === "saved") loadSavedPosts();
  }, [activeTab]);

  const handleUnsave = (postId: string) => {
    removeSaved(postId);
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (!user) return null;

  const displayName =
    user.role === "counsellor"
      ? user.display_name
      : user.visibility === "anonymous"
      ? "Anonymous Student"
      : user.visibility === "pseudonym"
      ? user.pseudonym
      : user.display_name;

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#004D2C] mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and saved content</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm mb-6 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-[#006B3F] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "saved"
                ? "bg-[#006B3F] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Posts
            {readSaved().length > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === "saved" ? "bg-white/30 text-white" : "bg-[#E8F5EE] text-[#006B3F]"
              }`}>
                {readSaved().length}
              </span>
            )}
          </button>
        </div>

        {/* ── Profile tab ────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <>
            {/* Profile Card */}
            
            <div className="bg-white rounded-xl shadow-md p-8 border border-[#E8F5EE] mb-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                  {user.role === "counsellor" ? (
                    <span className="text-4xl">👤</span>
                  ) : (
                    <AnonymousAvatar seed={user.id} size={96} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-[#004D2C]">{displayName}</h2>
                    {user.is_verified_counsellor && <CounsellorBadge />}
                  </div>
                  {user.role === "counsellor" && (
                    <p className="text-gray-600 mb-2">{user.counsellor_title}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    {user.role === "student" && user.visibility === "anonymous" && (
                      <span className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#006B3F] px-3 py-1 rounded-full">
                        <Shield className="w-3 h-3" />Fully Anonymous
                      </span>
                    )}
                    {user.role === "student" && user.visibility === "pseudonym" && (
                      <span className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#006B3F] px-3 py-1 rounded-full">
                        <User className="w-3 h-3" />Using Pseudonym
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              {user.role === "counsellor" && user.counsellor_bio && (
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

            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] mb-6">
              <h3 className="font-bold text-[#004D2C] mb-4">
                WhatsApp Notifications
              </h3>

              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="+233XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Button
                  onClick={handleSavePhone}
                  disabled={saving}
                  className="bg-[#006B3F] hover:bg-[#005533]"
                >
                  {saving ? "Saving..." : "Save Number"}
                </Button>

                <Button
                  onClick={sendMessages}
                  className="w-full"
                >
                  Send Audit Messages
                </Button>
              </div>
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
            {user.role === "student" && (
              <div className="bg-white rounded-xl p-6 border-l-4 border-[#006B3F] mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#006B3F] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-[#004D2C] mb-1">Your Privacy is Protected</p>
                    <p>
                      {user.visibility === "anonymous" &&
                        "You're fully anonymous. Other students see 'Anonymous Student'. Only counsellors see a unique ID for care."}
                      {user.visibility === "pseudonym" &&
                        `You're using the pseudonym "${user.pseudonym}". Your real identity remains private.`}
                      {user.visibility === "identified" &&
                        "You've chosen to use your real identity. Your name is visible on posts and comments."}
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
          </>
        )}

        {/* ── Saved Posts tab ────────────────────────────────────── */}
        {activeTab === "saved" && (
          <div>
            {savedLoading && (
              <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-500 border border-[#E8F5EE]">
                Loading saved posts…
              </div>
            )}

            {!savedLoading && savedPosts.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-14 text-center border border-[#E8F5EE]">
                <Bookmark className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-[#004D2C] mb-2">No saved posts yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Tap the bookmark icon on any community post to save it here.
                </p>
                <Link to="/feed">
                  <Button className="bg-[#006B3F] hover:bg-[#004D2C] text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Feed
                  </Button>
                </Link>
              </div>
            )}

            {!savedLoading && savedPosts.length > 0 && (
              <div className="space-y-4">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-md p-5 border border-[#E8F5EE] hover:border-[#006B3F] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <TopicTag topic={post.topic_tag} />
                      <button
                        type="button"
                        onClick={() => handleUnsave(post.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Remove from saved"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                      <Link
                        to={`/post/${post.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006B3F] hover:text-[#004D2C] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Read full post
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
