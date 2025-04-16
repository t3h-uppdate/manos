import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../lib/supabaseClient'; // Assuming your Supabase client is here

const CustomerLogin: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      // Login successful, redirect to booking portal or home page
      // TODO: Redirect to intended page if user was redirected here
      navigate('/book'); // Redirect to booking portal for now

    } catch (err: unknown) {
      console.error('Login error:', err);
      // Type guard for error message
      // Use translation key for default error
      let errorMessage = t('auth.customerLogin.errorGeneric');
      if (err instanceof Error) {
        errorMessage = err.message; // Keep specific DB/Auth errors if available
      } else if (typeof err === 'object' && err !== null && 'error_description' in err && typeof err.error_description === 'string') {
        errorMessage = err.error_description; // Supabase specific error field
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"> {/* Changed background */}
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          {/* Use translation key */}
          <h2 className="mt-6 text-center text-3xl font-serif text-gray-900"> {/* Changed font */}
            {t('auth.customerLogin.title')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              {/* Use translation key */}
              <label htmlFor="email-address" className="sr-only">{t('auth.customerLogin.emailLabel')}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:z-10 sm:text-sm"
                // Use translation key
                placeholder={t('auth.customerLogin.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              {/* Use translation key */}
              <label htmlFor="password" className="sr-only">{t('auth.customerLogin.passwordLabel')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:z-10 sm:text-sm"
                // Use translation key
                placeholder={t('auth.customerLogin.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {/* TODO: Add Password Reset Link */}
              {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a> */}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#D4AF37] hover:bg-[#B4941F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-50"
            >
              {/* Use translation keys */}
              {loading ? t('auth.customerLogin.loadingButton') : t('auth.customerLogin.submitButton')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <p>
            {/* Use translation keys */}
            {t('auth.customerLogin.noAccount')}{' '}
            <Link to="/register" className="font-medium text-[#D4AF37] hover:text-[#B4941F]"> {/* Changed link colors */}
              {t('auth.customerLogin.signUpLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin; // Use default export for pages usually
