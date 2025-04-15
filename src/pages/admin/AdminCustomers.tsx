import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient';
import Modal from '../../components/Modal';
import AddEditCustomerForm from '../../components/admin/AddEditCustomerForm';
import toast from 'react-hot-toast'; // Import toast

// Define the Customer type based on your Supabase schema
interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const AdminCustomers: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  // --- State Definitions ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // --- Data Fetching ---
  const fetchCustomers = useCallback(async () => {
    // Removed duplicate state setting from here
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCustomers(data || []);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      const errorMessage = err.message || t('admin.customers.errors.fetch');
      toast.error(errorMessage);
      setError(errorMessage); // Keep for conditional rendering
    }
    // setLoading handled in useEffect
  }, [t]); // Add t to dependency array

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const loadData = async () => {
        setLoading(true);
        setError(null);
        await fetchCustomers();
        if (isMounted) {
            setLoading(false);
        }
    };
    loadData();
    return () => { isMounted = false; }; // Cleanup function
  }, [fetchCustomers]);

  // --- Modal Control ---
  const handleOpenAddModal = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCustomerToEdit(null);
  };

  // --- CRUD Operations ---
  const handleFormSuccess = () => {
    fetchCustomers(); // Re-fetch after add/edit
    toast.success(t(customerToEdit ? 'admin.customers.notifications.update_success' : 'admin.customers.notifications.add_success'));
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm(t('admin.customers.confirm_delete'))) {
      return;
    }
    // Consider adding specific loading state for delete if needed
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (deleteError) throw deleteError;

      // Update local state
      setCustomers((currentCustomers: Customer[]) =>
        currentCustomers.filter((c: Customer) => c.id !== customerId)
      );
      toast.success(t('admin.customers.notifications.delete_success'));
    } catch (err: any) {
      console.error("Error deleting customer:", err);
      const errorMessage = err.message || t('admin.customers.errors.delete');
      toast.error(errorMessage);
      setError(errorMessage); // Keep for conditional rendering
    }
    // No finally block needed
  };

  // --- Render Logic ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{t('admin.customers.title')}</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('admin.customers.add_button')}
        </button>
      </div>

      {/* Add search/filter options here later */}

      {loading && <p>{t('common.loading')}</p>} {/* Use common loading key */}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Error message is already translated */}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.customers.table.name')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.customers.table.email')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.customers.table.phone')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.customers.table.joined')}</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span> {/* Use common actions key */}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {t('admin.customers.no_customers')}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email || t('common.not_applicable')}</td> {/* Use common N/A key */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone || t('common.not_applicable')}</td> {/* Use common N/A key */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()} {/* Date formatting is locale-aware, no direct translation needed here */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(customer)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50"
                        // disabled={loading} // Re-enable if general loading state is used for delete
                      >
                        {t('common.edit')} {/* Use common edit key */}
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        // disabled={loading} // Re-enable if general loading state is used for delete
                      >
                        {t('common.delete')} {/* Use common delete key */}
                      </button>
                      {/* Add View History button later */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Add pagination controls here later */}

      {/* Modal for Adding/Editing Customer */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t(customerToEdit ? 'admin.customers.edit_modal_title' : 'admin.customers.add_modal_title')}
      >
        <AddEditCustomerForm
          customerToEdit={customerToEdit}
          onFormSubmit={handleFormSuccess}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default AdminCustomers;
