import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useTranslation } from 'react-i18next';
import { Menu, Globe, LogOut } from 'lucide-react'; // Import LogOut icon
import { useAuth } from '../hooks/useAuth'; // Corrected import path

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, signOut, loading } = useAuth(); // Get user and signOut from context
  const navigate = useNavigate(); // Hook for navigation after logout

  const handleLogout = async () => {
    await signOut();
    // Optionally navigate to home or login page after logout
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang); // Save the new language
  };

  // Close mobile menu when navigating
  const handleMobileLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-serif text-gray-900">Manos</Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gold-600">{t('navigation.home')}</Link>
            <Link to="/about" className="text-gray-700 hover:text-gold-600">{t('navigation.about')}</Link>
            {/* TODO: Add i18n key for Book Now */}
            <Link to="/book" className="text-gray-700 hover:text-gold-600">Book Now</Link>
            <Link to="/contact" className="text-gray-700 hover:text-gold-600">{t('navigation.contact')}</Link>
            <button
              className="bg-[#D4AF37] text-white px-4 py-2 rounded hover:bg-[#B4941F] transition"
            >
              {t('navigation.findUs')}
            </button>

            {/* Conditional Auth Links */}
            {!loading && ( // Don't show links until auth state is loaded
               user ? (
                 <>
                   {/* Display user info (e.g., email) - can be enhanced */}
                   <span className="text-gray-700 text-sm hidden lg:block">{user.email}</span>
                   {/* TODO: Add i18n key for My Bookings */}
                   <Link to="/my-bookings" className="text-gray-700 hover:text-gold-600">My Bookings</Link>
                   <button
                     onClick={handleLogout}
                     className="flex items-center text-gray-700 hover:text-gold-600"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 mr-1" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-gold-600">Login</Link>
                  <Link to="/register" className="text-gray-700 hover:text-gold-600">Register</Link>
                </>
              )
            )}
            {/* End Conditional Auth Links */}

            <button onClick={toggleLanguage} className="text-gray-700">
              <Globe className="w-5 h-5" />
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">{t('navigation.home')}</Link>
              <Link to="/about" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">{t('navigation.about')}</Link>
              {/* TODO: Add i18n key for Book Now */}
              <Link to="/book" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">Book Now</Link>
              <Link to="/contact" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">{t('navigation.contact')}</Link>

              {/* Conditional Auth Links (Mobile) */}
              {!loading && (
                 user ? (
                    <>
                      {/* TODO: Add i18n key for My Bookings */}
                      <Link to="/my-bookings" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">My Bookings</Link>
                      <button
                        onClick={() => { handleLogout(); handleMobileLinkClick(); }}
                        className="block w-full text-left px-3 py-2 text-gray-700"
                      >
                        Logout ({user.email?.split('@')[0]}) {/* Show partial email */}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">Login</Link>
                      <Link to="/register" onClick={handleMobileLinkClick} className="block px-3 py-2 text-gray-700">Register</Link>
                    </>
                  )
              )}
              {/* End Conditional Auth Links (Mobile) */}

              <button
                className="block w-full text-left px-3 py-2 text-gray-700"
                onClick={() => { toggleLanguage(); handleMobileLinkClick(); }}
              >
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
