import { AlertCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function CrisisBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#DC2626] text-white rounded-lg p-4 shadow-lg mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">Crisis Detected - Immediate Support Available</h3>
          <p className="mb-3">
            We noticed your message contains concerning language. You don't have to go through this alone.
          </p>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">KNUST University Hospital: +233 3220 60360</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">Ghana Emergency: 112</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/crisis"
              className="px-4 py-2 bg-white text-[#DC2626] hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              View All Crisis Resources
            </Link>
            <Link
              to="/conversations"
              className="px-4 py-2 bg-[#b91c1c] hover:bg-[#991b1b] rounded-lg font-semibold transition-colors"
            >
              Talk to a Counsellor Now
            </Link>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
