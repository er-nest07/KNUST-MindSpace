import { Link } from "react-router";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#004D2C] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FDB913]">About MindSpace KNUST</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              A digital extension of KNUST's Counselling Unit, providing anonymous, 
              accessible mental wellness support for all students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FDB913]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/guidelines" className="text-gray-300 hover:text-[#FDB913] transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link to="/crisis" className="text-gray-300 hover:text-[#FDB913] transition-colors">
                  Crisis Resources
                </Link>
              </li>
              <li>
                <a href="https://www.knust.edu.gh" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FDB913] transition-colors">
                  KNUST Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact KNUST Counselling Unit */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FDB913]">KNUST Counselling Unit</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Great Hall Complex, KNUST Campus, Kumasi</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+233 3220 60315</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>counselling@knust.edu.gh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#006B3F] mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 Kwame Nkrumah University of Science and Technology. All rights reserved.</p>
          <p className="mt-2">MindSpace KNUST is an official KNUST Student Services initiative.</p>
        </div>
      </div>
    </footer>
  );
}
