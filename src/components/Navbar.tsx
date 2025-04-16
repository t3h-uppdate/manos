import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Import NavLink
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

  // Define NavLink classes
  const baseNavLinkClass = "text-gray-700 hover:text-gold-600 transition-colors duration-150";
  const activeNavLinkClass = "text-gold-600 font-semibold"; // Style for active link

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseNavLinkClass} ${isActive ? activeNavLinkClass : ''}`;


  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm"> {/* Added subtle shadow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-serif text-gray-900">Manos</Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={getNavLinkClass} end>{t('navigation.home')}</NavLink>
            <NavLink to="/about" className={getNavLinkClass}>{t('navigation.about')}</NavLink>
            <NavLink to="/book" className={getNavLinkClass}>{t('navigation.book_now')}</NavLink> {/* Use translation */}
            <NavLink to="/contact" className={getNavLinkClass}>{t('navigation.contact')}</NavLink>
            {/* Find Us Button - Assuming it links to contact for now */}
            <Link
              to="/contact#find-us" // Example: Link to a section in contact page
              className="bg-gold-600 text-white px-4 py-2 rounded hover:bg-gold-700 transition" // Use theme colors
            >
              {t('navigation.findUs')}
            </Link> {/* Corrected closing tag */}

            {/* Conditional Auth Links */}
            {!loading && ( // Don't show links until auth state is loaded
               user ? (
                 <>
                   {/* Display user info (e.g., email) - can be enhanced */}
                   <span className="text-gray-700 text-sm hidden lg:block" title={user.email}>{user.email?.split('@')[0]}</span> {/* Show partial email */}
                   <NavLink to="/my-bookings" className={getNavLinkClass}>{t('navigation.my_bookings')}</NavLink> {/* Use translation */}
                   <button
                     onClick={handleLogout}
                     className="flex items-center text-gray-700 hover:text-gold-600"
                     title={t('navigation.logout')} // Use translation for title
                   >
                     <LogOut className="w-5 h-5 mr-1" /> {t('navigation.logout')} {/* Use translation */}
                   </button>
                 </>
               ) : (
                 <>
                   <NavLink to="/login" className={getNavLinkClass}>{t('navigation.login')}</NavLink>
                   <NavLink to="/register" className={getNavLinkClass}>{t('navigation.register')}</NavLink>
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
            {/* Mobile Menu */}
            <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Use NavLink for mobile too */}
              <NavLink to="/" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`} end>{t('navigation.home')}</NavLink>
              <NavLink to="/about" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>{t('navigation.about')}</NavLink>
              <NavLink to="/book" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>{t('navigation.book_now')}</NavLink> {/* Use translation */}
              <NavLink to="/contact" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>{t('navigation.contact')}</NavLink>

              {/* Conditional Auth Links (Mobile) */}
              {!loading && (
                 user ? (
                    <>
                      <NavLink to="/my-bookings" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>{t('navigation.my_bookings')}</NavLink> {/* Use translation */}
                      <button
                        onClick={() => { handleLogout(); handleMobileLinkClick(); }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {t('navigation.logout')} ({user.email?.split('@')[0]}) {/* Use translation */}
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink to="/login" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>{t('navigation.login')}</NavLink>
                      <NavLink to="/register" onClick={handleMobileLinkClick} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>{t('navigation.register')}</NavLink>
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
