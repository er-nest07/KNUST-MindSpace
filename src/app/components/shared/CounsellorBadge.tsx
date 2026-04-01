import { CheckCircle } from "lucide-react";

export default function CounsellorBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#FDB913] text-[#004D2C] text-xs font-bold px-2 py-1 rounded-full">
      <CheckCircle className="w-3 h-3" />
      KNUST Counsellor
    </span>
  );
}
