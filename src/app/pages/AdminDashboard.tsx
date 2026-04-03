import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldBan, MessagesSquare, UserCheck, Flag, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { type DbComment, type DbPost, type DbProfile } from "../lib/community";

export default function AdminDashboard() {
  const [pendingCounsellors, setPendingCounsellors] = useState<DbProfile[]>([]);
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [comments, setComments] = useState<DbComment[]>([]);
  const [profilesById, setProfilesById] = useState<Map<string, DbProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    setIsLoading(true);
    setError("");

    const [{ data: counsellors, error: counsellorError }, { data: postRows, error: postError }, { data: commentRows, error: commentError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "counsellor")
        .eq("is_verified_counsellor", false)
        .eq("is_frozen", false)
        .order("created_at", { ascending: false }),
      supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("comments").select("*").order("created_at", { ascending: false }).limit(30),
    ]);

    if (counsellorError || postError || commentError) {
      setError(counsellorError?.message || postError?.message || commentError?.message || "Failed to load admin data.");
      setIsLoading(false);
      return;
    }

    const pending = (counsellors ?? []) as DbProfile[];
    const loadedPosts = (postRows ?? []) as DbPost[];
    const loadedComments = (commentRows ?? []) as DbComment[];

    setPendingCounsellors(pending);
    setPosts(loadedPosts);
    setComments(loadedComments);

    const profileIds = [...new Set([
      ...pending.map((profile) => profile.id),
      ...loadedPosts.map((post) => post.author_id),
      ...loadedComments.map((comment) => comment.author_id),
    ])];

    if (profileIds.length > 0) {
      const { data: profileRows } = await supabase.from("profiles").select("*").in("id", profileIds);
      const map = new Map<string, DbProfile>();
      ((profileRows ?? []) as DbProfile[]).forEach((profile) => map.set(profile.id, profile));
      setProfilesById(map);
    } else {
      setProfilesById(new Map());
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const visiblePosts = useMemo(() => posts.slice(0, 20), [posts]);
  const visibleComments = useMemo(() => comments.slice(0, 20), [comments]);

  const approveCounsellor = async (profileId: string) => {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_verified_counsellor: true, is_frozen: false, freeze_reason: null })
      .eq("id", profileId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAdminData();
  };

  const rejectCounsellor = async (profileId: string) => {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_frozen: true, freeze_reason: "Counsellor application rejected by admin" })
      .eq("id", profileId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAdminData();
  };

  const togglePostApproval = async (post: DbPost) => {
    const { error: updateError } = await supabase
      .from("posts")
      .update({ is_approved: !post.is_approved })
      .eq("id", post.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAdminData();
  };

  const toggleCommentFlag = async (comment: DbComment) => {
    const { error: updateError } = await supabase
      .from("comments")
      .update({ is_flagged: !comment.is_flagged })
      .eq("id", comment.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAdminData();
  };

  const deleteComment = async (commentId: string) => {
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadAdminData();
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#004D2C]">Admin Dashboard</h1>
          <p className="text-gray-600">Approve counsellors and moderate community activity.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl bg-white border border-[#E8F5EE] p-8 text-center text-gray-600">
            Loading admin data...
          </div>
        )}

        {!isLoading && (
          <>
            <section className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-xl font-bold text-[#004D2C]">Pending Counsellor Approvals ({pendingCounsellors.length})</h2>
              </div>

              {pendingCounsellors.length === 0 ? (
                <p className="text-gray-600">No pending counsellor applications.</p>
              ) : (
                <div className="space-y-4">
                  {pendingCounsellors.map((profile) => (
                    <div key={profile.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#004D2C]">{profile.display_name || profile.email}</p>
                          <p className="text-sm text-gray-600">{profile.email}</p>
                          <p className="text-sm text-gray-600">{profile.counsellor_title || "No title provided"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => approveCounsellor(profile.id)} className="bg-[#006B3F] hover:bg-[#004D2C] text-white">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="outline" onClick={() => rejectCounsellor(profile.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                            <ShieldBan className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-center gap-2 mb-4">
                <MessagesSquare className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-xl font-bold text-[#004D2C]">Post Moderation</h2>
              </div>
              <div className="space-y-3">
                {visiblePosts.map((post) => {
                  const author = profilesById.get(post.author_id);
                  return (
                    <div key={post.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500 mb-1">
                            {author?.display_name || author?.pseudonym || "Anonymous Student"} • {new Date(post.created_at).toLocaleString()}
                          </p>
                          <p className="text-gray-700 line-clamp-2">{post.content}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => togglePostApproval(post)}
                          className={post.is_approved ? "text-red-600 border-red-200 hover:bg-red-50" : "text-[#006B3F] border-[#006B3F] hover:bg-[#E8F5EE]"}
                        >
                          {post.is_approved ? "Hide" : "Approve"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-xl font-bold text-[#004D2C]">Comment Moderation</h2>
              </div>
              <div className="space-y-3">
                {visibleComments.map((comment) => {
                  const author = profilesById.get(comment.author_id);
                  return (
                    <div key={comment.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500 mb-1">
                            {author?.display_name || author?.pseudonym || "Anonymous Student"} • {new Date(comment.created_at).toLocaleString()}
                          </p>
                          <p className="text-gray-700 line-clamp-2">{comment.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => toggleCommentFlag(comment)}
                            className={comment.is_flagged ? "text-[#006B3F] border-[#006B3F] hover:bg-[#E8F5EE]" : "text-amber-700 border-amber-300 hover:bg-amber-50"}
                          >
                            {comment.is_flagged ? "Unflag" : "Flag"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => deleteComment(comment.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
