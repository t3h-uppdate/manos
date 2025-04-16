import React from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear(); // Get current year

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <p className="text-lg mb-4">{t('footer.followUs')}</p>
          <div className="flex space-x-4 mb-4"> {/* Added mb-4 for spacing */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37]">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37]">
              <Instagram className="w-6 h-6" />
            </a>
          </div>
          {/* Added Copyright */}
          <p className="text-sm text-gray-400 mt-4">
            © {currentYear} Manos. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
