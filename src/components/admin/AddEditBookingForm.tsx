import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast'; // Import toast for error messages

// Interfaces (consider moving to a shared types file)
interface Customer { id: string; name: string; }
// Removed Service and Staff interfaces as they are no longer selected here
interface Booking {
  id: string;
  customer_id: string;
  service_id: string | null;
  staff_id: string | null;
  start_time: string | null; // Allow null in the interface
  end_time: string | null;   // Allow null in the interface
  status: string;
  notes: string | null;
  message: string | null; // Added message field
}

interface AddEditBookingFormProps {
  bookingToEdit?: Booking | null; // bookingToEdit itself can be null or undefined
  onFormSubmit: () => void;
  onClose: () => void;
}

// Helper to parse duration string "HH:MM:SS" to minutes - No translatable text here
const durationToMinutes = (interval: string | null): number => {
  if (!interval) return 0;
  const parts = interval.split(':');
  return (parseInt(parts[0], 10) * 60) + (parseInt(parts[1], 10));
};

const AddEditBookingForm: React.FC<AddEditBookingFormProps> = ({
  bookingToEdit,
  onFormSubmit,
  onClose,
}) => {
  const { t } = useTranslation(); // Initialize useTranslation
  // Form State
  const [customerId, setCustomerId] = useState('');
  // Removed serviceId and staffId state
  const [startTime, setStartTime] = useState(''); // Store as ISO-like string for datetime-local input
  const [endTime, setEndTime] = useState('');   // Store as ISO-like string
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState(''); // Added message state

  // Dropdown Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Removed services and staff state

  // Loading/Error State
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);

  const isEditing = !!bookingToEdit;

  // Fetch data for dropdowns
  const fetchDropdownData = useCallback(async () => {
    setDataLoadingError(null);
    try {
      // Only fetch customers now
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');

      if (customerError) throw customerError;

      setCustomers(customerData || []);
      // Removed setting services and staff
    } catch (err: any) {
      console.error("Error fetching customer data:", err);
      const errorMessage = t('admin.forms.booking.errors.load_customers');
      setDataLoadingError(errorMessage);
      toast.error(errorMessage); // Also show toast
    }
  }, [t]); // Add t to dependency array

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
   // Updated signature to explicitly accept undefined
   const formatDateTimeForInput = (isoString: string | null | undefined): string => {
    // Check for null, undefined, or empty string explicitly
    if (isoString === null || isoString === undefined || isoString === '') {
        return '';
    }
    // Now isoString is guaranteed to be a non-empty string
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) { // Extra check for invalid date object
             console.error("Invalid date passed to formatDateTimeForInput:", isoString);
             return '';
        }
        // Adjust for timezone offset to display correctly in local time input
        const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (e) {
        console.error("Error formatting date:", e);
        return '';
    }
  };

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditing && bookingToEdit) {
      setCustomerId(bookingToEdit.customer_id);
      // Removed setting serviceId and staffId
      setStartTime(formatDateTimeForInput(bookingToEdit.start_time ?? null));
      setEndTime(formatDateTimeForInput(bookingToEdit.end_time ?? null));
      setStatus(bookingToEdit.status);
      setNotes(bookingToEdit.notes || '');
      setMessage(bookingToEdit.message || ''); // Pre-fill message
    } else {
      // Reset form
      setCustomerId('');
      // Removed resetting serviceId and staffId
      setStartTime('');
      setEndTime('');
      setStatus('scheduled');
      setNotes('');
      setMessage(''); // Reset message
    }
  }, [bookingToEdit, isEditing]);

  // Removed useEffect for auto-calculating end time


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    // Basic Validation - Only Customer, Start, End times are required now
    if (!customerId || !startTime || !endTime) {
      setFormError(t('admin.forms.booking.errors.required_fields'));
      setLoading(false);
      return;
    }

     // Convert local datetime-local string back to UTC ISO string for Supabase
    const formatDateTimeForSupabase = (localDateTime: string): string | null => {
        if (!localDateTime) return null;
        try {
            // Directly create Date object from local time string
            const date = new Date(localDateTime);
             if (isNaN(date.getTime())) { // Check if date is valid
                console.error("Invalid date string for Supabase conversion:", localDateTime);
                return null;
            }
            return date.toISOString();
        } catch (e) {
            console.error("Error formatting date for Supabase:", e);
            return null;
        }
    };

    const bookingData = {
      customer_id: customerId,
      service_id: null, // Always null
      staff_id: null, // Always null
      start_time: formatDateTimeForSupabase(startTime),
      end_time: formatDateTimeForSupabase(endTime),
      status: status,
      notes: notes.trim() || null,
      message: message.trim() || null, // Add message
    };

     // Ensure dates are valid before proceeding
    if (!bookingData.start_time || !bookingData.end_time) {
        setFormError(t('admin.forms.booking.errors.invalid_datetime'));
        setLoading(false);
        return;
    }

    try {
      let query;
      if (isEditing && bookingToEdit) {
        query = supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', bookingToEdit.id);
      } else {
        query = supabase.from('bookings').insert([bookingData]);
      }

      const { error: queryError } = await query;

      if (queryError) throw queryError;

      onFormSubmit();
      onClose();

    } catch (err: any) {
      console.error("Error saving booking:", err);
      const saveError = err.message || t(isEditing ? 'admin.forms.booking.errors.update' : 'admin.forms.booking.errors.add');
      setFormError(saveError);
      toast.error(saveError); // Show toast on save error
    } finally {
      setLoading(false);
    }
  };

  if (dataLoadingError) {
    // Error is already translated and shown via toast, maybe just show a simple message here
    return <p className="text-red-600">{t('admin.forms.booking.errors.load_failed')}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{formError}</p>} {/* Error message is already translated */}

      {/* Customer Select */}
      <div>
        <label htmlFor="booking-customer" className="block text-sm font-medium text-gray-700">{t('admin.forms.booking.labels.customer')} <span className="text-red-500">*</span></label>
        <select
          id="booking-customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading || customers.length === 0}
        >
          <option value="" disabled>{t('admin.forms.booking.select_customer')}</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Service Select Removed */}

      {/* Staff Select Removed */}

       {/* Start Time */}
      <div>
          <label htmlFor="booking-start-time" className="block text-sm font-medium text-gray-700">{t('admin.forms.booking.labels.start_time')} <span className="text-red-500">*</span></label>
          <input
              type="datetime-local"
              id="booking-start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={loading}
          />
      </div>

       {/* End Time */}
       <div>
          <label htmlFor="booking-end-time" className="block text-sm font-medium text-gray-700">{t('admin.forms.booking.labels.end_time')} <span className="text-red-500">*</span></label>
          <input
              type="datetime-local"
              id="booking-end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              // End time is always manually entered now
              disabled={loading}
              readOnly={false} // Always editable
          />
           {/* Removed helper text about auto-calculation */}
      </div>

       {/* Status Select */}
      <div>
        <label htmlFor="booking-status" className="block text-sm font-medium text-gray-700">{t('admin.forms.booking.labels.status')}</label>
        <select
          id="booking-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
        >
          {/* Translate status options */}
          <option value="scheduled">{t('admin.forms.booking.status_options.scheduled')}</option>
          <option value="completed">{t('admin.forms.booking.status_options.completed')}</option>
          <option value="cancelled">{t('admin.forms.booking.status_options.cancelled')}</option>
          <option value="no-show">{t('admin.forms.booking.status_options.no_show')}</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700">{t('admin.forms.booking.labels.notes')}</label>
        <textarea
          id="booking-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
          placeholder={t('admin.forms.booking.placeholders.notes')}
        />
      </div>

      {/* Message / Needs */}
      <div>
        <label htmlFor="booking-message" className="block text-sm font-medium text-gray-700">{t('admin.forms.booking.labels.message_needs')}</label>
        <textarea
          id="booking-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading}
          placeholder={t('admin.forms.booking.placeholders.message_needs')}
        />
      </div>


      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">{t('common.cancel')}</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {loading ? t('common.saving') : (isEditing ? t('admin.forms.booking.buttons.update') : t('admin.forms.booking.buttons.add'))}
        </button>
      </div>
    </form>
  );
};

export default AddEditBookingForm;
