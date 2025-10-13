import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/mes-modernization', label: 'MES Modernization Strategy' },
    { path: '/great-bake-off', label: 'The Great MES Modernization Bake-Off' },
    { path: '/chatbot', label: 'AI Assistant' },
    { path: '/feedback', label: 'Feedback' },
    { path: '/reference-materials', label: 'Reference Materials' },
    { path: '/faqs', label: 'FAQs' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-mn-primary shadow-lg" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <div className="text-white">
                <h1 className="text-xl font-bold">Minnesota DHS</h1>
                <p className="text-sm text-mn-neutral-blue">MES Modernization Challenge</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-white hover:text-mn-accent-yellow transition-colors duration-200 font-medium ${
                  location.pathname === item.path ? 'text-mn-accent-yellow border-b-2 border-mn-accent-yellow' : ''
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-white hover:text-mn-accent-yellow transition-colors duration-200"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            id="mobile-menu"
            className="lg:hidden py-4 border-t border-mn-accent-teal"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-white hover:text-mn-accent-yellow transition-colors duration-200 py-2 px-2 rounded font-medium ${
                    location.pathname === item.path ? 'text-mn-accent-yellow bg-mn-accent-teal bg-opacity-20' : ''
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;