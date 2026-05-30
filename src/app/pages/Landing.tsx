import { Link } from "react-router";
import { Shield, MessageCircle, Users, Lock, Heart, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006B3F] to-[#004D2C] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-6xl">🎓</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your mind matters.<br />You're not alone.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
            MindSpace KNUST is a safe, anonymous platform connecting students with 
            professional counselling support — without the stigma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register?role=student"
              className="w-full sm:w-auto px-8 py-4 bg-[#006B3F] hover:bg-[#004D2C] text-white rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Join as Student
            </Link>
            <Link
              to="/register?role=counsellor"
              className="w-full sm:w-auto px-8 py-4 bg-[#FDB913] hover:bg-[#e5a710] text-[#004D2C] rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              I'm a Counsellor
            </Link>
          </div>
        </div>
      </section>

      {/* Why MindSpace Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004D2C] text-center mb-12">
            Why MindSpace KNUST?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[#006B3F]" />
              </div>
              <h3 className="text-xl font-bold text-[#004D2C] mb-3">100% Anonymous</h3>
              <p className="text-gray-600">
                Share your thoughts without revealing your identity. You control what you share.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#006B3F]" />
              </div>
              <h3 className="text-xl font-bold text-[#004D2C] mb-3">KNUST Verified</h3>
              <p className="text-gray-600">
                All counsellors are licensed professionals verified by KNUST's Counselling Unit.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#006B3F]" />
              </div>
              <h3 className="text-xl font-bold text-[#004D2C] mb-3">Community Support</h3>
              <p className="text-gray-600">
                Connect with peers facing similar challenges in a moderated, supportive space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-[#E8F5EE]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004D2C] text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#006B3F] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#004D2C] mb-2">Share Your Story</h3>
                  <p className="text-gray-600">
                    Post anonymously about what you're going through. Our AI moderates for safety 
                    and connects you with the right support.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#006B3F] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#004D2C] mb-2">Get Support</h3>
                  <p className="text-gray-600">
                    Receive responses from verified KNUST counsellors and supportive peers 
                    who understand what you're going through.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#006B3F] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#004D2C] mb-2">Direct Counselling</h3>
                  <p className="text-gray-600">
                    Start a private conversation with a counsellor. AI support is available 24/7 
                    until a professional can connect with you.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#006B3F] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#004D2C] mb-2">Join Programmes</h3>
                  <p className="text-gray-600">
                    Get enrolled in structured support programmes tailored to your needs — 
                    from stress management to addiction recovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anonymity Promise */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#E8F5EE] rounded-2xl p-8 md:p-12 border-2 border-[#006B3F]">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-[#006B3F]" />
            </div>
            <h2 className="text-3xl font-bold text-[#004D2C] text-center mb-4">
              Our Promise to You
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#006B3F] flex-shrink-0 mt-1" />
                <p>
                  <strong>Your identity is protected.</strong> You choose how much to share — 
                  stay fully anonymous, use a pseudonym, or reveal your identity only when you're ready.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#006B3F] flex-shrink-0 mt-1" />
                <p>
                  <strong>Professional support, not replacement.</strong> We're not replacing your 
                  counsellor — we're making sure you actually reach one.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#006B3F] flex-shrink-0 mt-1" />
                <p>
                  <strong>Safe and moderated.</strong> AI reviews all posts to ensure safety. 
                  Crisis situations are immediately flagged for urgent professional attention.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#006B3F] flex-shrink-0 mt-1" />
                <p>
                  <strong>Always accessible.</strong> Crisis resources are available even without 
                  an account, 24/7, no barriers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Counsellors Do */}
      <section className="py-16 px-4 bg-[#E8F5EE]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004D2C] text-center mb-6">
            About Our Counsellors
          </h2>
          <div className="bg-white rounded-xl shadow-md p-8 border border-[#E8F5EE]">
            <p className="text-gray-700 mb-4">
              All counsellors on MindSpace KNUST are licensed professionals registered with 
              KNUST's Counselling Unit. They are trained in:
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-[#006B3F] font-bold">•</span>
                <span>Clinical psychology and mental health counselling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006B3F] font-bold">•</span>
                <span>Crisis intervention and suicide prevention</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006B3F] font-bold">•</span>
                <span>Student mental wellness and academic stress management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006B3F] font-bold">•</span>
                <span>Trauma-informed care and culturally sensitive practice</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Every counsellor displays a <span className="inline-flex items-center bg-[#FDB913] text-[#004D2C] text-xs font-bold px-2 py-1 rounded-full">✓ KNUST Counsellor</span> badge 
              to verify their credentials.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#006B3F] to-[#004D2C] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Join hundreds of KNUST students finding support, connection, and professional guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#FDB913] hover:bg-[#e5a710] text-[#004D2C] rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/guidelines"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white rounded-lg font-semibold text-lg transition-colors"
            >
              Read Community Guidelines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
