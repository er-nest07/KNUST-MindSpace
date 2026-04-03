import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageCircle, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { type DbProfile } from "../lib/community";

export default function BrowseCounsellors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counsellors, setCounsellors] = useState<DbProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCounsellors = async () => {
      setIsLoading(true);
      setError("");

      const { data, error: loadError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "counsellor")
        .eq("is_verified_counsellor", true)
        .eq("is_frozen", false)
        .order("display_name", { ascending: true });

      if (loadError) {
        setError(loadError.message);
        setIsLoading(false);
        return;
      }

      setCounsellors((data ?? []) as DbProfile[]);
      setIsLoading(false);
    };

    loadCounsellors();
  }, []);

  const startConversation = async (counsellorId: string) => {
    if (!user) return;

    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("student_id", user.id)
      .eq("counsellor_id", counsellorId)
      .maybeSingle();

    if (existingConversation?.id) {
      navigate(`/chat/${existingConversation.id}`);
      return;
    }

    const { data, error: createError } = await supabase
      .from("conversations")
      .insert({
        student_id: user.id,
        counsellor_id: counsellorId,
        status: "active",
      })
      .select("id")
      .single<{ id: string }>();

    if (createError) {
      setError(createError.message);
      return;
    }

    if (data?.id) {
      navigate(`/chat/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#004D2C] mb-2">Browse Counsellors</h1>
            <p className="text-gray-600">Choose a verified counsellor and start a private conversation.</p>
          </div>
          <Link to="/conversations" className="hidden sm:inline-flex">
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              My Conversations
            </Button>
          </Link>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">Loading counsellors...</div>
        ) : counsellors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="font-bold text-[#004D2C] mb-2">No verified counsellors yet</h2>
            <p className="text-gray-600">Once an admin verifies counsellors, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counsellors.map((counsellor) => (
              <div key={counsellor.id} className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h2 className="text-lg font-bold text-[#004D2C]">{counsellor.display_name || counsellor.email}</h2>
                      <CounsellorBadge />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{counsellor.counsellor_title || 'Verified counsellor'}</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{counsellor.counsellor_bio || 'Available for private support.'}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Button
                    onClick={() => startConversation(counsellor.id)}
                    className="bg-[#006B3F] hover:bg-[#004D2C] text-white"
                  >
                    Start Conversation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}