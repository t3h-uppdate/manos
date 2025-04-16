import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      // On successful login, redirect to the admin dashboard
      navigate('/admin');

    } catch (error: unknown) {
      // Type guard for error message
      // Use translation key for default error
      let errorMessage = t('auth.login.errorUnknown');
      if (error instanceof Error) {
        errorMessage = error.message; // Keep specific DB/Auth errors if available
      } else if (typeof error === 'object' && error !== null && 'error_description' in error && typeof error.error_description === 'string') {
        errorMessage = error.error_description; // Supabase specific error field
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Use translation key */}
        <h1 className="text-2xl font-bold text-center text-gray-800">{t('auth.login.title')}</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            {/* Use translation key */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {t('auth.login.emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              // Use translation key
              placeholder={t('auth.login.emailPlaceholder')}
              disabled={loading}
            />
          </div>
          <div>
            {/* Use translation key */}
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {t('auth.login.passwordLabel')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              // Use translation key
              placeholder={t('auth.login.passwordPlaceholder')}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {/* Use translation keys */}
              {loading ? t('auth.login.loadingButton') : t('auth.login.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
