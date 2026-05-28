import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  initialLikes?: number;
  initialComments?: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
  onLike?: (postId: string, nowLiked: boolean) => void;
  onSave?: (postId: string, nowSaved: boolean) => void;
  onCommentToggle?: () => void;
}

export default function PostActions({
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialLiked = false,
  initialSaved = false,
  onLike,
  onSave,
  onCommentToggle,
}: PostActionsProps) {
  const [isLiked, setIsLiked]         = useState(initialLiked);
  const [isSaved, setIsSaved]         = useState(initialSaved);
  const [likeCount, setLikeCount]     = useState(initialLikes);
  const [likeAnim, setLikeAnim]       = useState(false);
  const [saveAnim, setSaveAnim]       = useState(false);
  const [shareDone, setShareDone]     = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);

  const KNUST_GREEN = "#006B3F";
  const KNUST_GOLD  = "#FDB913";

  const handleLike = () => {
    const nowLiked = !isLiked;
    setIsLiked(nowLiked);
    setLikeCount((c) => c + (nowLiked ? 1 : -1));
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    if (nowLiked) {
      const id = Date.now();
      setFloatingHearts((h) => [...h, id]);
      setTimeout(() => setFloatingHearts((h) => h.filter((x) => x !== id)), 700);
    }
    onLike?.(postId, nowLiked);
  };

  const handleSave = () => {
    const nowSaved = !isSaved;
    setIsSaved(nowSaved);
    setSaveAnim(true);
    setTimeout(() => setSaveAnim(false), 300);
    toast.success(nowSaved ? "Post saved!" : "Post unsaved");
    onSave?.(postId, nowSaved);
  };

  // Share — works on both http and https
  const handleShare = () => {
    const url = `${window.location.origin}/post/${postId}`;
    const doCopy = (text: string) => {
      // Modern API (HTTPS / production)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          setShareDone(true);
          toast.success("Link copied!");
          setTimeout(() => setShareDone(false), 2000);
        });
        return;
      }
      // Fallback for http://localhost
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;left:-9999px;top:-9999px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand("copy");
        setShareDone(true);
        toast.success("Link copied!");
        setTimeout(() => setShareDone(false), 2000);
      } catch {
        toast.error("Could not copy link — try manually copying the URL.");
      }
      document.body.removeChild(el);
    };

    // Use Web Share API on mobile if available
    if (navigator.share) {
      navigator.share({ title: "MindSpace Post", url }).catch(() => doCopy(url));
    } else {
      doCopy(url);
    }
  };

  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 select-none cursor-pointer border-none bg-transparent";

  return (
    <div className="relative">
      {floatingHearts.map((id) => (
        <span key={id} className="absolute pointer-events-none text-xl animate-float-up"
          style={{ left: 12, bottom: 32, color: KNUST_GREEN }}>♥</span>
      ))}

      <div className="flex items-center gap-1 pt-3 border-t border-gray-100">

        {/* Like */}
        <button type="button" onClick={handleLike}
          className={btnBase}
          style={isLiked ? { color: KNUST_GREEN, background: "#E8F5EE" } : { color: "#6b7280" }}>
          <Heart className="w-4 h-4 transition-transform duration-200"
            style={{
              transform: likeAnim ? "scale(1.5)" : "scale(1)",
              fill: isLiked ? KNUST_GREEN : "none",
              color: isLiked ? KNUST_GREEN : "currentColor",
            }} />
          <span className="font-medium min-w-[14px]">{likeCount}</span>
        </button>

        {/* Comment */}
        <button type="button" onClick={onCommentToggle}
          className={`${btnBase} text-gray-500 hover:bg-gray-100`}
          style={{ color: "#6b7280" }}>
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium min-w-[14px]">{initialComments}</span>
        </button>

        {/* Save */}
        <button type="button" onClick={handleSave}
          className={btnBase}
          style={isSaved ? { color: KNUST_GOLD, background: "#FFFBEB" } : { color: "#6b7280" }}>
          <Bookmark className="w-4 h-4 transition-transform duration-200"
            style={{
              transform: saveAnim ? "scale(1.25)" : "scale(1)",
              fill: isSaved ? KNUST_GOLD : "none",
              color: isSaved ? KNUST_GOLD : "currentColor",
            }} />
          <span>Save</span>
        </button>

        <div className="flex-1" />

        {/* Share — shows checkmark for 2s after copying */}
        <button type="button" onClick={handleShare}
          className={`${btnBase} ${shareDone ? "" : "text-gray-500 hover:bg-gray-100"}`}
          style={shareDone ? { color: KNUST_GREEN, background: "#E8F5EE" } : {}}>
          {shareDone
            ? <><Check className="w-4 h-4" /><span>Copied!</span></>
            : <><Share2 className="w-4 h-4" /><span>Share</span></>
          }
        </button>

      </div>
    </div>
  );
}