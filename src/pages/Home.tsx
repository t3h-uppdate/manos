import React from 'react';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://i.postimg.cc/cL6q6wKh/24fef006-d343-4989-9c6d-f1822b98fa69.png")',
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