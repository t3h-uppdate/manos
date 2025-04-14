import React from 'react';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
            {t('home.welcome')}
          </h1>
          <p className="text-xl md:text-2xl text-[#D4AF37]">
            {t('home.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
};