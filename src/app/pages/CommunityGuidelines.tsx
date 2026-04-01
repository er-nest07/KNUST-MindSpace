import { Heart, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-[#E8F5EE] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 border border-[#E8F5EE]">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 text-[#006B3F]" />
            </div>
            <h1 className="text-4xl font-bold text-[#004D2C] mb-4">Community Guidelines</h1>
            <p className="text-lg text-gray-600">
              Building a safe, supportive space for mental wellness at KNUST
            </p>
          </div>

          {/* Core Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#E8F5EE] rounded-lg p-6">
                <Heart className="w-8 h-8 text-[#006B3F] mb-3" />
                <h3 className="font-bold text-[#004D2C] mb-2">Compassion</h3>
                <p className="text-sm text-gray-700">
                  Every person here is going through something real. Respond with empathy.
                </p>
              </div>
              <div className="bg-[#E8F5EE] rounded-lg p-6">
                <Shield className="w-8 h-8 text-[#006B3F] mb-3" />
                <h3 className="font-bold text-[#004D2C] mb-2">Respect</h3>
                <p className="text-sm text-gray-700">
                  Honor each other's boundaries, identities, and choices.
                </p>
              </div>
              <div className="bg-[#E8F5EE] rounded-lg p-6">
                <CheckCircle className="w-8 h-8 text-[#006B3F] mb-3" />
                <h3 className="font-bold text-[#004D2C] mb-2">Safety</h3>
                <p className="text-sm text-gray-700">
                  We protect this space so everyone can share openly and heal.
                </p>
              </div>
            </div>
          </section>

          {/* What We Encourage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#16A34A]" />
              What We Encourage
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold text-xl">✓</span>
                <div>
                  <strong>Share your story authentically.</strong> Your experiences matter and can help others feel less alone.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold text-xl">✓</span>
                <div>
                  <strong>Listen with empathy.</strong> Sometimes the best support is saying "I hear you" without trying to fix.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold text-xl">✓</span>
                <div>
                  <strong>Ask for help when you need it.</strong> Reaching out is a sign of strength, not weakness.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold text-xl">✓</span>
                <div>
                  <strong>Respect anonymity.</strong> Never try to figure out who someone is. Anonymity is sacred here.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold text-xl">✓</span>
                <div>
                  <strong>Report concerning content.</strong> If you see something that breaks these guidelines or worries you, flag it.
                </div>
              </li>
            </ul>
          </section>

          {/* What's Not Allowed */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-[#DC2626]" />
              What's Not Allowed
            </h2>
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 rounded">
                <strong className="text-[#DC2626]">Harassment or bullying</strong>
                <p className="text-sm text-gray-700 mt-1">
                  Targeted attacks, name-calling, or deliberately hurtful comments toward any individual or group.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 rounded">
                <strong className="text-[#DC2626]">De-anonymization attempts</strong>
                <p className="text-sm text-gray-700 mt-1">
                  Trying to figure out someone's identity, sharing private information, or "outing" another student.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 rounded">
                <strong className="text-[#DC2626]">Harmful advice or content</strong>
                <p className="text-sm text-gray-700 mt-1">
                  Promoting self-harm, suicide, substance abuse, eating disorders, or other dangerous behaviors.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 rounded">
                <strong className="text-[#DC2626]">Spam or trolling</strong>
                <p className="text-sm text-gray-700 mt-1">
                  Repeated irrelevant posts, advertising, or deliberately disruptive behavior.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 rounded">
                <strong className="text-[#DC2626]">Impersonation</strong>
                <p className="text-sm text-gray-700 mt-1">
                  Pretending to be a counsellor, admin, or another user.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 rounded">
                <strong className="text-[#DC2626]">Discrimination</strong>
                <p className="text-sm text-gray-700 mt-1">
                  Content that attacks or demeans people based on identity, including race, gender, sexuality, religion, disability, or mental health status.
                </p>
              </div>
            </div>
          </section>

          {/* Crisis Situations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
              If You're in Crisis
            </h2>
            <div className="bg-[#FFF7ED] border-2 border-[#FDB913] rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                <strong>This platform is not for emergency situations.</strong> If you're thinking of harming yourself or others, 
                or if you're in immediate danger:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-center gap-2">
                  <span className="font-bold">•</span>
                  Call Ghana Emergency Services: <strong>112</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">•</span>
                  Call KNUST University Hospital: <strong>+233 3220 60360</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">•</span>
                  Visit our <a href="/crisis" className="text-[#006B3F] hover:underline font-semibold">Crisis Resources page</a>
                </li>
              </ul>
              <p className="text-sm text-gray-600">
                Our AI system automatically detects crisis language and will route you to urgent support, 
                but never rely on this as your only safety plan.
              </p>
            </div>
          </section>

          {/* Anonymity Rules */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6">Understanding Anonymity</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>You control your identity.</strong> You can be fully anonymous, use a pseudonym, or choose to be identified. 
                This choice is yours and should be respected.
              </p>
              <div className="bg-[#E8F5EE] rounded-lg p-6">
                <h3 className="font-bold text-[#004D2C] mb-3">For Students:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• You will never see another student's real identity unless they explicitly choose to share it</li>
                  <li>• Counsellors see a unique Student ID (not your name) to track your care</li>
                  <li>• You can change your visibility settings at any time in your profile</li>
                </ul>
              </div>
              <div className="bg-[#FFF7ED] rounded-lg p-6">
                <h3 className="font-bold text-[#004D2C] mb-3">For Counsellors:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Always identified with name, photo, title, and verification badge</li>
                  <li>• Never reveal student identities to other students or unauthorized parties</li>
                  <li>• Maintain KNUST Counselling Unit confidentiality standards</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Role of Counsellors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6">What Counsellors Can and Cannot Do</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#16A34A] mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Counsellors Can:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Provide professional guidance and support</li>
                  <li>• Help you develop coping strategies</li>
                  <li>• Connect you with campus resources</li>
                  <li>• Enroll you in structured support programmes</li>
                  <li>• Respond to posts and messages during work hours</li>
                  <li>• Flag urgent situations for immediate intervention</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#DC2626] mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Counsellors Cannot:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Diagnose medical or psychiatric conditions via the app</li>
                  <li>• Prescribe medications</li>
                  <li>• Replace in-person emergency care</li>
                  <li>• Be available 24/7 (AI holds space until they're online)</li>
                  <li>• Break confidentiality except in cases of harm risk</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Consequences */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#004D2C] mb-6">Enforcement & Consequences</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Violations of these guidelines are taken seriously. Depending on severity, consequences include:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#FDB913]">1.</span>
                  <div>
                    <strong>Warning:</strong> First-time minor violations receive a warning with guidance.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#FDB913]">2.</span>
                  <div>
                    <strong>Temporary Freeze (24-72 hours):</strong> Account paused for review by counsellors.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#FDB913]">3.</span>
                  <div>
                    <strong>Extended Freeze:</strong> Counsellors may extend suspension for repeated violations.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#DC2626]">4.</span>
                  <div>
                    <strong>Permanent Ban:</strong> Severe violations (harassment, de-anonymization, harmful content) 
                    result in permanent removal and possible referral to KNUST administration.
                  </div>
                </div>
              </div>
              <p className="text-sm bg-[#E8F5EE] p-4 rounded">
                <strong>Important:</strong> Even if your account is frozen, you'll always have access to our 
                Crisis Resources page. Safety comes first.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-[#004D2C] mb-4">Updates to Guidelines</h2>
            <p className="text-gray-700 mb-4">
              These guidelines may be updated as our community grows and we learn what works best. 
              Major changes will be announced on the platform, and continued use means you accept the updated guidelines.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: April 1, 2026
            </p>
          </section>

          {/* Footer CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-700 mb-4">
              Have questions about these guidelines? Contact the KNUST Counselling Unit.
            </p>
            <a
              href="mailto:counselling@knust.edu.gh"
              className="inline-block px-6 py-3 bg-[#006B3F] hover:bg-[#004D2C] text-white rounded-lg font-semibold transition-colors"
            >
              Contact Counselling Unit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
