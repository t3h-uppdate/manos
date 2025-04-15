import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient';
import Modal from '../../components/Modal';
import AddEditBookingForm from '../../components/admin/AddEditBookingForm';
import toast from 'react-hot-toast'; // Import toast

// Define the Booking type including related data from joins
interface Booking {
  id: string;
  customer_id: string;
  service_id: string | null;
  staff_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  message: string | null; // Added message field
  created_at: string;
  customers: { name: string } | null; // Joined data
  services: { name: string } | null; // Joined data (still useful for older/manual bookings)
  staff: { name: string } | null;     // Joined data
}

// Helper function to format date and time
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '-';
  const date = new Date(dateTimeString);
  return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }); // Adjust format as needed
};

const AdminBookings: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  // --- State ---
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);

  // --- Data Fetching ---
  const fetchBookings = useCallback(async () => {
    // setLoading/setError handled in useEffect wrapper
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          customers ( name ),
          services ( name ),
          staff ( name )
        `)
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data as Booking[] || []);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      const errorMessage = err.message || t('admin.bookings.errors.fetch');
      toast.error(errorMessage);
      setError(errorMessage); // Keep for conditional rendering
    }
  }, [t]); // Add t to dependency array

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await fetchBookings();
      if (isMounted) {
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchBookings]);

  // --- Modal Control ---
  const handleOpenAddModal = () => {
    setBookingToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking: Booking) => {
    setBookingToEdit(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBookingToEdit(null);
  };

  // --- CRUD Operations ---
  const handleFormSuccess = () => {
    fetchBookings(); // Re-fetch after add/edit
    toast.success(t(bookingToEdit ? 'admin.bookings.notifications.update_success' : 'admin.bookings.notifications.add_success'));
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm(t('admin.bookings.confirm_delete'))) {
      return;
    }
    try {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (deleteError) throw deleteError;

      setBookings((currentBookings: Booking[]) =>
        currentBookings.filter((b: Booking) => b.id !== bookingId)
      );
      toast.success(t('admin.bookings.notifications.delete_success'));
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      const errorMessage = err.message || t('admin.bookings.errors.delete');
      toast.error(errorMessage);
      setError(errorMessage); // Keep for conditional rendering
    }
  };

  // --- Render Logic ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{t('admin.bookings.title')}</h1>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t('admin.bookings.add_button')}
        </button>
      </div>

      {/* Add search/filter options here later */}

      {loading && <p>{t('common.loading')}</p>}
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Error message is already translated */}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.customer')}</th>
                {/* Replacing Service with Message */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.message_needs')}</th>
                {/* Removed Staff Column Header */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.start_time')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.end_time')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.status')}</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  {/* Adjusted colSpan */}
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {t('admin.bookings.no_bookings')}
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.customers?.name || t('common.not_applicable')}</td>
                    {/* Display message, fallback to service name if message is null/empty but service exists */}
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={booking.message || booking.services?.name || ''}>
                      {booking.message || booking.services?.name || t('common.not_applicable')}
                    </td>
                    {/* Removed Staff Column Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(booking.start_time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(booking.end_time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                       {/* Add styling based on status later */}
                       {booking.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(booking)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
       {/* Add pagination controls here later */}

       {/* Modal for Adding/Editing Booking */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t(bookingToEdit ? 'admin.bookings.edit_modal_title' : 'admin.bookings.add_modal_title')}
      >
        {/* Render form only when modal is open to ensure dropdown data is fresh */}
        {isModalOpen && (
            <AddEditBookingForm
              bookingToEdit={bookingToEdit}
              onFormSubmit={handleFormSuccess}
              onClose={handleCloseModal}
            />
        )}
      </Modal>
    </div>
  );
};

export default AdminBookings;
