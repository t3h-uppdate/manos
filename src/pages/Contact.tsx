import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendMessage } from '../lib/messageApi'; // Import the API function

export const Contact = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(t('contact.form.sending'));

    const success = await sendMessage({ name, phone, email, message });

    setLoading(false);
    if (success) {
      toast.success(t('contact.form.success'), { id: toastId });
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } else {
      toast.error(t('contact.form.error'), { id: toastId });
    }
  };

  // Removed pt-16 and min-h-screen from the top-level div.
  // The parent <main> in App.tsx handles the layout flow and padding.
  return (
    <div className="bg-gray-50 flex-grow"> {/* Use flex-grow if needed, or just let content dictate height */}
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">
                  {t('contact.form.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700">
                  {t('contact.form.phone')}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                  {t('contact.form.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">
                  {t('contact.form.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-white px-4 py-2 rounded hover:bg-[#B4941F] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('contact.form.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
