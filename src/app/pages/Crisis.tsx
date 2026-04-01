import { Phone, AlertCircle, Heart } from "lucide-react";

export default function Crisis() {
  return (
    <div className="min-h-screen bg-[#E8F5EE] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Emergency Banner */}
        <div className="bg-[#DC2626] text-white rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold mb-2">Immediate Crisis Support</h1>
              <p className="text-lg">
                If you are in immediate danger, please call Ghana Emergency Services: <strong className="text-xl">112</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Message of Hope */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-[#E8F5EE]">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-[#006B3F]" />
            <h2 className="text-2xl font-bold text-[#004D2C]">You Are Not Alone</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            We understand that you're going through a difficult time. What you're feeling is valid, 
            and there are people ready to help you right now — no judgment, no barriers.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The numbers below connect you directly to trained professionals who care and are 
            available to listen and support you through this moment.
          </p>
        </div>

        {/* Crisis Contacts */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#004D2C] mb-6">Crisis Hotlines & Resources</h2>

          {/* KNUST University Hospital */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#006B3F]">
            <h3 className="text-xl font-bold text-[#004D2C] mb-2">KNUST University Hospital</h3>
            <p className="text-gray-600 mb-3">24/7 Emergency Medical & Mental Health Services</p>
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-[#006B3F]" />
              <a href="tel:+233322060360" className="text-2xl font-bold text-[#006B3F] hover:text-[#004D2C]">
                +233 3220 60360
              </a>
            </div>
            <p className="text-sm text-gray-500">Located on campus, near the Library</p>
          </div>

          {/* KNUST Security */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#006B3F]">
            <h3 className="text-xl font-bold text-[#004D2C] mb-2">KNUST Security (Campus Emergency)</h3>
            <p className="text-gray-600 mb-3">For immediate campus safety concerns</p>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#006B3F]" />
              <a href="tel:+233322060311" className="text-2xl font-bold text-[#006B3F] hover:text-[#004D2C]">
                +233 3220 60311
              </a>
            </div>
          </div>

          {/* KNUST Counselling Unit */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#FDB913]">
            <h3 className="text-xl font-bold text-[#004D2C] mb-2">KNUST Counselling Unit</h3>
            <p className="text-gray-600 mb-3">Professional mental health support during business hours</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#FDB913]" />
                <a href="tel:+233322060315" className="text-xl font-bold text-[#004D2C] hover:text-[#006B3F]">
                  +233 3220 60315
                </a>
              </div>
              <p className="text-sm text-gray-500 ml-8">Great Hall Complex, KNUST Campus</p>
              <p className="text-sm text-gray-500 ml-8">Monday - Friday: 8:00 AM - 5:00 PM</p>
            </div>
          </div>

          {/* Mental Health Authority Ghana */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#16A34A]">
            <h3 className="text-xl font-bold text-[#004D2C] mb-2">Mental Health Authority Ghana</h3>
            <p className="text-gray-600 mb-3">Free national mental health helpline</p>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#16A34A]" />
              <a href="tel:0800111253" className="text-2xl font-bold text-[#16A34A] hover:text-[#15803d]">
                0800-111-253
              </a>
              <span className="bg-[#16A34A] text-white text-xs font-bold px-2 py-1 rounded">TOLL-FREE</span>
            </div>
          </div>

          {/* Befrienders Ghana */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#16A34A]">
            <h3 className="text-xl font-bold text-[#004D2C] mb-2">Befrienders Ghana (Accra)</h3>
            <p className="text-gray-600 mb-3">Emotional support and suicide prevention</p>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#16A34A]" />
              <a href="tel:+233244846800" className="text-2xl font-bold text-[#16A34A] hover:text-[#15803d]">
                +233 244 846 800
              </a>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 border border-[#E8F5EE]">
          <h2 className="text-xl font-bold text-[#004D2C] mb-4">What to Expect When You Call</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-[#006B3F] font-bold text-lg">•</span>
              <span>A trained counselor or healthcare professional will answer</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#006B3F] font-bold text-lg">•</span>
              <span>They will listen without judgment and help you feel less alone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#006B3F] font-bold text-lg">•</span>
              <span>You can remain anonymous if you choose</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#006B3F] font-bold text-lg">•</span>
              <span>They will help you develop a safety plan and connect you with ongoing support</span>
            </li>
          </ul>
        </div>

        {/* Warning Signs */}
        <div className="bg-[#FFF7ED] border-2 border-[#FDB913] rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-[#004D2C] mb-3">Recognizing a Mental Health Crisis</h3>
          <p className="text-gray-700 mb-3">Seek help immediately if you or someone you know is experiencing:</p>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>Thoughts of harming yourself or others</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>Feeling hopeless or having no reason to live</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>Overwhelming anxiety, panic, or fear</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>Inability to care for yourself (eating, sleeping, hygiene)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>Severe mood swings or behavioral changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#DC2626] font-bold">•</span>
              <span>Seeing or hearing things that others don't</span>
            </li>
          </ul>
        </div>

        {/* Back to Platform */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need non-crisis support?</p>
          <a
            href="/feed"
            className="inline-block px-6 py-3 bg-[#006B3F] hover:bg-[#004D2C] text-white rounded-lg font-semibold transition-colors"
          >
            Return to MindSpace
          </a>
        </div>
      </div>
    </div>
  );
}
