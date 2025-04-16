import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen">
      {/* Background Image and Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://i.postimg.cc/y8Hp9Rrc/37c01a98-6f41-413b-9b01-4a9eb33dbd49.png")',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div> {/* Slightly darker overlay for potentially lighter image */}
      </div>
      
      {/* Centered Content */}
      <div className="relative min-h-screen flex items-center justify-center text-center px-4 py-16"> {/* Added padding */}
        <div className="max-w-3xl"> {/* Limit content width */}
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6"> {/* Increased margin bottom */}
            {t('about.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-4"> {/* Adjusted text color and size */}
            {t('about.paragraph1')}
          </p>
          <p className="text-lg md:text-xl text-gray-200"> {/* Adjusted text color and size */}
            {t('about.paragraph2')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
