import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Clock } from 'lucide-react';

export const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif text-center mb-12">{t('contact.title')}</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-serif mb-4">{t('contact.hours')}</h2>
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-[#D4AF37] mr-2" />
                <p>Mon - Fri: 9:00 AM - 8:00 PM</p>
              </div>
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 text-[#D4AF37] mr-2" />
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-[#D4AF37] mr-2" />
                <p>info@manosbarber.com</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.2922926!3d48.8583736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwNTEnMzAuMCJOIDLCsDE3JzMyLjMiRQ!5e0!3m2!1sen!2s!4v1625661051415!5m2!1sen!2s"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('contact.form.message')}
                </label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#D4AF37] text-white px-4 py-2 rounded hover:bg-[#B4941F] transition"
              >
                {t('contact.form.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};