import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient'; // Adjust path as needed
import { toast } from 'react-hot-toast'; // Import toast for error messages

// Define Customer interface (consider moving to a shared types file)
interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface AddEditCustomerFormProps {
  customerToEdit?: Customer | null; // Pass customer data for editing
  onFormSubmit: () => void; // Callback after successful submission
  onClose: () => void; // Function to close the modal
}

const AddEditCustomerForm: React.FC<AddEditCustomerFormProps> = ({
  customerToEdit,
  onFormSubmit,
  onClose,
}) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!customerToEdit;

  useEffect(() => {
    if (isEditing && customerToEdit) {
      setName(customerToEdit.name);
      setEmail(customerToEdit.email || '');
      setPhone(customerToEdit.phone || '');
    } else {
      // Reset form for adding
      setName('');
      setEmail('');
      setPhone('');
    }
  }, [customerToEdit, isEditing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation (can be enhanced)
    if (!name.trim()) {
        setError(t('admin.forms.customer.errors.name_required'));
        setLoading(false);
        return;
    }

    const customerData = {
      name: name.trim(),
      email: email.trim() || null, // Store null if empty
      phone: phone.trim() || null, // Store null if empty
    };

    try {
      let query;
      if (isEditing && customerToEdit) {
        // Update existing customer
        query = supabase
          .from('customers')
          .update(customerData)
          .eq('id', customerToEdit.id);
      } else {
        // Insert new customer
        query = supabase.from('customers').insert([customerData]);
      }

      const { error: queryError } = await query;

      if (queryError) {
        // Handle potential duplicate email errors etc.
        if (queryError.message.includes('duplicate key value violates unique constraint')) {
             setError(t('admin.forms.customer.errors.email_exists'));
        } else {
            throw queryError; // Rethrow other errors
        }
      } else {
        onFormSubmit(); // Notify parent component of success
        onClose(); // Close the modal
      }

    } catch (err: unknown) {
      console.error("Error saving customer:", err);
      // Type guard for error message
      let saveError = t(isEditing ? 'admin.forms.customer.errors.update' : 'admin.forms.customer.errors.add');
      if (err instanceof Error) {
        saveError = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
        saveError = err.message;
      }
      setError(saveError);
      toast.error(saveError); // Show toast on save error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{error}</p>} {/* Error message is already translated */}

      <div>
        <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">
          {t('admin.forms.customer.labels.name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="customer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700">
          {t('admin.forms.customer.labels.email')}
        </label>
        <input
          type="email"
          id="customer-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
          placeholder={t('admin.forms.customer.placeholders.email')}
        />
      </div>

       <div>
        <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700">
          {t('admin.forms.customer.labels.phone')}
        </label>
        <input
          type="tel" // Use tel type for better mobile UX
          id="customer-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
          placeholder={t('admin.forms.customer.placeholders.phone')}
        />
      </div>


      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {t('common.cancel')} {/* Use common cancel key */}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? t('common.saving') : (isEditing ? t('admin.forms.customer.buttons.update') : t('admin.forms.customer.buttons.add'))}
        </button>
      </div>
    </form>
  );
};

export default AddEditCustomerForm;
