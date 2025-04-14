import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Globe } from 'lucide-react';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-serif text-gray-900">Manos</Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gold-600">{t('navigation.home')}</Link>
            <Link to="/about" className="text-gray-700 hover:text-gold-600">{t('navigation.about')}</Link>
            <Link to="/contact" className="text-gray-700 hover:text-gold-600">{t('navigation.contact')}</Link>
            <button
              className="bg-[#D4AF37] text-white px-4 py-2 rounded hover:bg-[#B4941F] transition"
            >
              {t('navigation.findUs')}
            </button>
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
              <Link to="/" className="block px-3 py-2 text-gray-700">{t('navigation.home')}</Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700">{t('navigation.about')}</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700">{t('navigation.contact')}</Link>
              <button
                className="block w-full text-left px-3 py-2 text-gray-700"
                onClick={toggleLanguage}
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