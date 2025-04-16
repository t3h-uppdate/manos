import React, { useState, useEffect, useRef } from 'react'; // Added useState, useEffect, useRef
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Import NavLink
import { useTranslation } from 'react-i18next';
import { Menu, Globe, LogOut, MoreHorizontal } from 'lucide-react'; // Import LogOut and MoreHorizontal icons
import { useAuth } from '../hooks/useAuth'; // Corrected import path

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // State for the "More" dropdown
  const moreMenuRef = useRef<HTMLDivElement>(null); // Ref for click outside detection
  const { user, signOut, loading, isAdmin } = useAuth(); // Get user, signOut, isAdmin from context
  const navigate = useNavigate(); // Hook for navigation after logout

  const handleLogout = async () => {
    await signOut();
    setIsMoreMenuOpen(false); // Close more menu on logout
    setIsMenuOpen(false); // Close mobile menu on logout
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang); // Save the new language
  };

  // Close mobile menu when navigating
  // Close mobile menu when navigating
  const handleMobileLinkClick = () => {
    setIsMenuOpen(false);
    setIsMoreMenuOpen(false); // Also close more menu if open
  };

  // Close More menu when navigating from it
  const handleMoreMenuLinkClick = () => {
    setIsMoreMenuOpen(false);
    // Don't close the main mobile menu here, only the more menu
  };


  // Define NavLink classes
  const baseNavLinkClass = "text-gray-700 hover:text-gold-600 transition-colors duration-150";
  const activeNavLinkClass = "text-gold-600 font-semibold"; // Style for active link

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseNavLinkClass} ${isActive ? activeNavLinkClass : ''}`;

  // Click outside handler for the "More" menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm"> {/* Added subtle shadow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-serif text-gray-900">Manos</Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 relative"> {/* Added relative positioning context */}
            <NavLink to="/" className={getNavLinkClass} end>{t('navigation.home')}</NavLink>
            <NavLink to="/about" className={getNavLinkClass}>{t('navigation.about')}</NavLink>
            <NavLink to="/contact" className={getNavLinkClass}>{t('navigation.contact')}</NavLink>
            <NavLink to="/inventory" className={getNavLinkClass}>{t('navigation.inventory')}</NavLink> {/* Added Inventory */}
            {/* Find Us Button */}
            <Link
              to="/contact#find-us" // Example: Link to a section in contact page
              className="bg-gold-600 text-white px-4 py-2 rounded hover:bg-gold-700 transition" // Use theme colors
            >
              {t('navigation.findUs')}
            </Link>
            {/* Book Now Button */}
            <NavLink
              to="/book"
              className="bg-gold-600 text-white px-4 py-2 rounded hover:bg-gold-700 transition" // Styled as button
            >
              {t('navigation.book_now')}
            </NavLink>

            <button onClick={toggleLanguage} className="text-gray-700 hover:text-gold-600"> {/* Added hover */}
              <Globe className="w-5 h-5" />
            </button>

            {/* Conditional Auth Links */}
            {!loading && ( // Don't show links until auth state is loaded
             user ? (
               <div ref={moreMenuRef}> {/* Wrap button and dropdown for click outside */}
                 <button
                   onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                   className="flex items-center text-gray-700 hover:text-gold-600"
                   title={t('navigation.more')} // Added translation key
                 >
                   <MoreHorizontal className="w-5 h-5" />
                 </button>
                 {/* More Dropdown Menu */}
                 {isMoreMenuOpen && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-60">
                     {/* Display user info */}
                     <div className="px-4 py-2 text-sm text-gray-500 border-b">
                       {t('navigation.signedInAs')}{' '} {/* Added translation key */}
                       <span className="font-medium text-gray-700" title={user.email}>
                         {user.email?.split('@')[0]}
                       </span>
                     </div>
                     <NavLink
                       to="/my-bookings"
                       onClick={handleMoreMenuLinkClick}
                       className={({ isActive }) => `block px-4 py-2 text-sm ${isActive ? 'text-gold-600 bg-gold-50' : 'text-gray-700'} hover:bg-gray-100`}
                     >
                       {t('navigation.my_bookings')}
                     </NavLink>
                     {isAdmin && (
                       <NavLink
                         to="/admin/"
                         onClick={handleMoreMenuLinkClick}
                         className={({ isActive }) => `block px-4 py-2 text-sm ${isActive ? 'text-gold-600 bg-gold-50' : 'text-gray-700'} hover:bg-gray-100`}
                       >
                         {t('navigation.adminDashboard')}
                       </NavLink>
                     )}
                     <button
                       onClick={handleLogout}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       {t('navigation.logout')}
                     </button>
                   </div>
                 )}
               </div>
             ) : (
               <>
                 {/* Show Login/Register only when logged out */}
                 <NavLink to="/login" className={getNavLinkClass}>{t('navigation.login')}</NavLink>
                 <NavLink to="/register" className={getNavLinkClass}>{t('navigation.register')}</NavLink>
               </>
             )
            )}
            {/* End Conditional Auth Links */}
          </div>

          {/* Mobile Menu Button */}
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
              {/* Base class for mobile links */}
              {(() => {
                const mobileBaseClass = "block px-3 py-2 rounded-md text-base font-medium";
                const mobileActiveClass = "bg-gold-50 text-gold-700";
                const mobileInactiveClass = "text-gray-700 hover:bg-gray-50 hover:text-gray-900";
                const mobileButtonClass = "block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-gold-600 text-white hover:bg-gold-700 transition"; // Button style
                const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) => `${mobileBaseClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`;

                return (
                  <>
                    <NavLink to="/" onClick={handleMobileLinkClick} className={getMobileNavLinkClass} end>{t('navigation.home')}</NavLink>
                    <NavLink to="/about" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.about')}</NavLink>
                    <NavLink to="/contact" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.contact')}</NavLink>
                    <NavLink to="/inventory" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.inventory')}</NavLink> {/* Added Inventory */}
                    {/* Find Us Button (Mobile) - Links to contact page section */}
                    <Link
                      to="/contact#find-us"
                      onClick={handleMobileLinkClick}
                      className={mobileButtonClass} // Button style
                    >
                      {t('navigation.findUs')}
                    </Link>
                    {/* Book Now Button (Mobile) */}
                    <NavLink
                      to="/book"
                      onClick={handleMobileLinkClick}
                      className={mobileButtonClass} // Button style
                    >
                      {t('navigation.book_now')}
                    </NavLink>

                    <button
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900" // Standard text button style
                      onClick={() => { toggleLanguage(); handleMobileLinkClick(); }}
                    >
                      {i18n.language === 'en' ? 'العربية' : 'English'}
                    </button>

                    {/* Conditional Auth Links (Mobile) */}
                    {!loading && (
                      user ? (
                        <>
                          {/* User Info */}
                          <div className="px-3 py-2 text-sm text-gray-500 border-t border-b">
                            {t('navigation.signedInAs')}{' '} {/* Added translation key */}
                            <span className="font-medium text-gray-700" title={user.email}>
                              {user.email?.split('@')[0]}
                            </span>
                          </div>
                          {/* Always show My Bookings */}
                           <NavLink to="/my-bookings" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.my_bookings')}</NavLink>
                          {/* Conditionally render Admin Dashboard link (Mobile) */}
                          {isAdmin && (
                            <NavLink to="/admin/" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.adminDashboard')}</NavLink>
                          )}
                          {/* Logout Button */}
                          <button
                            onClick={() => { handleLogout(); handleMobileLinkClick(); }} // handleMobileLinkClick closes the main menu
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          >
                            {t('navigation.logout')}
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Show Login/Register only when logged out */}
                          <NavLink to="/login" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.login')}</NavLink>
                          <NavLink to="/register" onClick={handleMobileLinkClick} className={getMobileNavLinkClass}>{t('navigation.register')}</NavLink>
                        </>
                      )
                    )}
                    {/* End Conditional Auth Links (Mobile) */}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
