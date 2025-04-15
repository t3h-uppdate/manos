import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Removed useNavigate
import { supabase } from '../lib/supabaseClient';
// We might need findOrCreateCustomer if we want to prevent duplicate customer entries
// even if auth signup fails later, but let's keep it simple for now.
// We'll create the customer record *after* successful auth signup.

const CustomerRegister: React.FC = () => {
  // Removed navigate initialization
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For success messages (e.g., check email)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // Optional: Add user metadata here if needed immediately
          // data: { full_name: name, phone: phone }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if user object exists and has an ID
      if (!authData.user?.id) {
          throw new Error("Registration successful but user ID not found.");
      }

      const userId = authData.user.id;

      // 2. Create the corresponding customer record in the public.customers table
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
            auth_user_id: userId, // Link to the auth user
            name: name,
            email: email, // Store email here too for easier access/display
            phone: phone || null,
        });

       if (customerError) {
           // Note: Ideally, we might want to roll back the auth user creation
           // if the customer record fails, but that's more complex (e.g., using edge functions).
           // For now, log the error and inform the user.
           console.error("Error creating customer profile:", customerError);
           throw new Error(`Account created, but failed to save profile: ${customerError.message}`);
       }

      // Registration successful
      setMessage("Registration successful! Please check your email to confirm your account.");
      // Don't navigate immediately, user needs to confirm email usually
      // navigate('/login');

    } catch (err: unknown) {
      console.error('Registration error:', err);
      // Type guard for error message
      let errorMessage = 'Failed to register.';
      if (err instanceof Error) {
        errorMessage = err.message;
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          {message && <div className="p-3 bg-green-100 text-green-700 rounded">{message}</div>}

          <div className="rounded-md shadow-sm -space-y-px">
             <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
             <div>
              <label htmlFor="phone" className="sr-only">Phone Number (Optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
