import React from 'react';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mn-primary text-white py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Minnesota DHS</h3>
              <p className="text-sm text-mn-neutral-blue">Department of Human Services</p>
            </div>
            <p className="text-sm text-mn-neutral-blue">
              Modernizing Minnesota's Medicaid Enterprise Systems through innovation partnerships and strategic transformation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-mn-accent-yellow">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/mes-modernization" className="text-sm text-mn-neutral-blue hover:text-white transition-colors">
                  MES Modernization Strategy
                </a>
              </li>
              <li>
                <a href="/great-bake-off" className="text-sm text-mn-neutral-blue hover:text-white transition-colors">
                  The Great MES Modernization Bake-Off
                </a>
              </li>
              <li>
                <a href="/feedback" className="text-sm text-mn-neutral-blue hover:text-white transition-colors">
                  Feedback
                </a>
              </li>
              <li>
                <a href="/reference-materials" className="text-sm text-mn-neutral-blue hover:text-white transition-colors">
                  Reference Materials
                </a>
              </li>
              <li>
                <a href="/admin/login" className="text-sm text-mn-neutral-blue hover:text-white transition-colors">
                  Admin
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-mn-accent-yellow">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-mn-accent-yellow" aria-hidden="true" />
                <span className="text-sm text-mn-neutral-blue">mes.modernization.dhs@state.mn.us</span>
              </div>
            </div>
          </div>
        </div>
        </div>
    </footer>
  );
};

export default Footer;