import React, { useState, useEffect } from 'react'; // Removed useLayoutEffect
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Import useNavigate, useLocation, and Link
import { useTranslation } from 'react-i18next'; // Import useTranslation
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles
// Import API functions to fetch services, staff, availability, and create bookings
import { fetchStaffAvailability, AvailableSlot } from '../lib/availabilityApi'; // Import availability API and type
import { createBooking, NewBookingData } from '../lib/bookingApi'; // Import booking API and type
import { findOrCreateCustomer } from '../lib/customerApi'; // Import customer API
import { useAuth } from '../hooks/useAuth'; // Updated import path for useAuth
import Modal from '../components/Modal'; // Import the Modal component
// Removed serviceApi import
// TODO: Import necessary types (Service, Staff, Booking etc.)
// TODO: Import components for displaying services, calendar/time slots, forms

// Removed Service type import

// Define a default duration in minutes for fetching slots and calculating end time
const DEFAULT_APPOINTMENT_DURATION = 30; // Changed from 60

const BookingPortal: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const { user, loading: authLoading } = useAuth(); // Get user state
  const navigate = useNavigate(); // Get navigate function
  const location = useLocation(); // Get location for redirect logic
  const [step, setStep] = useState<number>(1); // 1: Select Time, 2: Enter Details, 3: Confirmation
  // Removed services and selectedService state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]); // Use AvailableSlot type
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null); // Use AvailableSlot type
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // State for selected date, default to today
  const [clientPhone, setClientPhone] = useState(''); // Keep phone state separate
  const [clientMessage, setClientMessage] = useState(''); // State for the client's message
  const [loading, setLoading] = useState<boolean>(false); // Loading state for API calls within the component
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false); // State for login/register modal

  // Removed useEffect for fetching services

  // Fetch availability when date is selected/changed
  useEffect(() => {
    // Only fetch if we have a selected date
    if (selectedDate) {
      const loadAvailability = async () => {
        setLoading(true);
        setError(null);
        setSelectedSlot(null); // Clear previously selected slot when date changes
        setAvailableSlots([]); // Clear previous slots list while loading new date
        try {
          // Fetch availability for the specific selected date using the updated function signature
          // Use the default duration since service selection is removed
          const slots = await fetchStaffAvailability(
            DEFAULT_APPOINTMENT_DURATION, // Use default duration
            selectedDate // Pass the selected date object
          );
          setAvailableSlots(slots);
          if (slots.length === 0) {
              // Optionally set a specific message if no slots are found vs. an error
              // setError("No available slots found for this date.");
          }
        } catch (err) {
          console.error("Failed to load availability:", err);
          // Use translation key for error message
          const message = err instanceof Error ? err.message : t('booking.errorLoadAvailability');
          setError(message);
          // toast.error(message);
        } finally {
          setLoading(false);
        }
      };
      loadAvailability();
    } else {
       // If no date selected, clear slots
       setAvailableSlots([]);
    }
    // Dependency array now only includes selectedDate
  }, [selectedDate]);

  // Removed handleSelectService

  const handleSelectSlot = (slot: AvailableSlot) => { // Update parameter type
    if (!user) {
      // If user is not logged in, show the modal instead of proceeding
      setShowAuthModal(true);
    } else {
      // If user is logged in, proceed to the details step
      setSelectedSlot(slot);
      setStep(2); // Move to step 2 (Enter Details)
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in before submitting
    if (!user || !user.email) {
        // Use translation key for error message
        setError(t('booking.errorAuthRequired'));
        navigate('/login?redirect=/book');
        return;
    }

    // Check only for selectedSlot
    if (!selectedSlot || !selectedSlot.datetime) {
      // Use translation key for error message
      setError(t('booking.errorSelectSlot'));
      return;
    }
    // Add validation for the message if required (e.g., not empty)
    if (!clientMessage.trim()) {
        // Use translation key for error message
        setError(t('booking.errorEnterMessage'));
        return; // Prevent submission if message is empty
    }


    setLoading(true);
    setError(null);

    try {
      // 1. Find or Create Customer using logged-in user's details
      const customerName = user.user_metadata?.full_name || user.email.split('@')[0]; // Example fallback

      // Ensure user is non-null here (already checked at function start)
      if (!user) {
          // Use translation key for internal error
          throw new Error(t('booking.errorUserNotAuthInternal')); // Should not happen
      }

      const customerId = await findOrCreateCustomer({
          authUserId: user.id, // Pass the Supabase Auth User ID
          name: customerName, // Use name from auth or fallback
          email: user.email, // Use email from auth user
          phone: clientPhone || null, // Use phone from state
      });

      // 2. Calculate end time using the default duration
      const startTime = new Date(selectedSlot.datetime);
      const endTime = new Date(startTime.getTime() + DEFAULT_APPOINTMENT_DURATION * 60000); // Use default duration

      // 3. Prepare Booking Data with customer_id, message, and null service_id
      const bookingData: NewBookingData = {
        service_id: null, // Set service_id to null
        staff_id: null, // Set staff_id to null for simplified booking
        customer_id: customerId, // Use the retrieved/created customer ID from findOrCreateCustomer
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        message: clientMessage.trim(), // Include the client's message
        // status: 'confirmed', // Handled by API function default
      };

      // 4. Create the Booking
      await createBooking(bookingData);
      setStep(3); // Move to confirmation step (new Step 3)
    } catch (err) {
      console.error("Failed to create booking:", err);
      // Use translation key for error message
      const message = err instanceof Error ? err.message : t('booking.errorCreateBooking');
      setError(message);
      // Optionally add toast notification
      // toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Removed the useLayoutEffect that handled redirection for steps 2 & 3

  const renderStepContent = () => {
    // Show loading indicator while checking auth state initially
    if (authLoading) {
        // Use translation key
        return <div className="text-center p-10">{t('booking.authenticating')}</div>;
    }

    // If we are in a protected step but the effect hasn't redirected yet (e.g., mid-render), render null
     if ((step === 2 || step === 3) && !user) {
        return null;
     }

    // Proceed with rendering steps if authenticated or if step doesn't require auth
    // Use common loading key
    if (loading && step !== 1) return <div className="text-center p-10">{t('common.loading')}</div>;
    // Error is already potentially translated from API calls or validation checks
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;


    switch (step) {
      // Step 1 is now Select Time Slot
      case 1:
        return (
          <div>
            {/* Use translation key */}
            <h2 className="text-2xl font-semibold mb-4">{t('booking.selectDateTimeTitle')}</h2>
            {/* Removed Back button */}

            {/* Date Picker */}
            <div className="mb-6">
              {/* Use translation key */}
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">{t('booking.selectDateLabel')}</label>
              <DatePicker
                id="bookingDate"
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()} // Prevent selecting past dates
                inline // Display calendar directly on the page
                className="p-2 border rounded" // Basic styling for input if not inline
              />
            </div>

            {/* Available Slots for Selected Date */}
            {/* Use translation key with interpolation and fallback key */}
            <h3 className="text-xl font-semibold mb-3">{t('booking.availableSlotsTitle', { date: selectedDate ? selectedDate.toLocaleDateString() : t('booking.selectedDateFallback') })}:</h3>
            {loading ? ( // Show loading indicator when fetching slots
                 <p>{/* Use translation key */}{t('booking.loadingSlots')}</p>
            ) : availableSlots.length === 0 ? (
              <p>{/* Use translation key */}{t('booking.noSlots')}</p>
            ) : (
              // Display simple list of time slots
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                 {/* Sort slots by time */}
                 {availableSlots
                    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                    .map((slot) => (
                      <button
                        key={slot.datetime} // Use datetime as key
                        onClick={() => handleSelectSlot(slot)}
                        className="p-2 border rounded bg-gray-100 hover:bg-[#D4AF37]/20 text-center text-sm" // Update hover color
                      >
                        {/* Format time as HH-mm (24-hour) */}
                        {`${String(new Date(slot.datetime).getHours()).padStart(2, '0')}-${String(new Date(slot.datetime).getMinutes()).padStart(2, '0')}`}
                      </button>
                 ))}
              </div>
            )}
          </div>
        );
      // Step 2 is now Enter Details
      case 2:
        return (
          <div>
            {/* Use translation key */}
            <h2 className="text-2xl font-semibold mb-4">{t('booking.enterDetailsTitle')}</h2>
            {/* Use translation key */}
            <button onClick={() => setStep(1)} className="mb-4 text-[#D4AF37] hover:text-[#B4941F] hover:underline">{t('booking.backToTimeSelection')}</button> {/* Update text color */}
            {/* Removed service name */}
            {/* Use translation keys for structure */}
            <p className="mb-4">{t('booking.bookingAtPrefix')} <strong>{selectedSlot ? new Date(selectedSlot.datetime).toLocaleString() : ''}</strong>{t('booking.bookingAtSuffix')}</p>
            {/* Display logged-in user email */}
            {/* Use translation key with interpolation */}
            <p className="mb-4 text-sm text-gray-600">{t('booking.bookingAs', { email: user?.email })}</p>
            <form onSubmit={handleBookingSubmit} className="space-y-4 max-w-md mx-auto">
              {/* Removed Name and Email fields */}
              <div>
                {/* Use translation key */}
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('booking.phoneLabel')}</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)} // Update phone state directly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50" // Update focus style
                />
              </div>
              {/* Add Message Textarea */}
              <div>
                {/* Use translation key */}
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('booking.messageLabel')}</label>
                <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    required // Make message required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#D4AF37] focus:ring focus:ring-[#D4AF37] focus:ring-opacity-50" // Update focus style
                    // Use translation key for placeholder
                    placeholder={t('booking.messagePlaceholder')}
                />
              </div>
              {/* Use translation keys for button text */}
              <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#B4941F] text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"> {/* Update button color */}
                {loading ? t('booking.bookingButtonLoading') : t('booking.confirmButton')}
              </button>
            </form>
          </div>
        );
      // Step 3 is now Confirmation
      case 3:
        // Auth check is now handled by useLayoutEffect above
        // Although checked earlier, add explicit check for user to satisfy TS
        if (!user) return null; // Should not happen due to useLayoutEffect, but satisfies TS

        return (
          <div className="text-center p-10">
            {/* Use translation key */}
            <h2 className="text-2xl font-semibold mb-4 text-green-600">{t('booking.confirmationTitle')}</h2>
            {/* Use user email or fetched name */}
            {/* Use translation key with interpolation */}
            <p>{t('booking.confirmationGreeting', { name: user.user_metadata?.full_name || user.email })}</p>
            {/* Removed service name */}
            {/* Use translation keys for structure */}
            <p>{t('booking.confirmationMessagePrefix')} <strong>{selectedSlot ? new Date(selectedSlot.datetime).toLocaleString() : ''}</strong>{t('booking.confirmationMessageSuffix')}</p>
            {/* Use translation key */}
            <p className="mt-2">{t('booking.reviewMessagePrompt')}</p>
            <p className="mt-1 p-2 bg-gray-100 rounded text-sm text-left italic">"{clientMessage}"</p>
            {/* Use translation key */}
            <p className="mt-4">{t('booking.confirmationEmailNotice')}</p>
            {/* Reset state including message */}
            {/* Use translation key */}
            <button onClick={() => { setStep(1); setSelectedSlot(null); setClientPhone(''); setClientMessage(''); setSelectedDate(new Date()); }} className="mt-6 bg-[#D4AF37] hover:bg-[#B4941F] text-white font-bold py-2 px-4 rounded"> {/* Update button color */}
              {t('booking.bookAnotherButton')}
            </button>
          </div>
        );
      default:
        // Use translation key
        return <div>{t('booking.invalidStep')}</div>;
    }
  };

  return (
    <div className="bg-gray-50"> {/* Apply background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Standardize container */}
        {/* Use translation key */}
        <h1 className="text-4xl font-serif text-center mb-12">{t('booking.pageTitle')}</h1> {/* Update title style */}
        {renderStepContent()}

        {/* Login/Register Modal */}
      </div> {/* Close the max-w-7xl container HERE */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={t('booking.authModal.title')} // Use translation key
      >
        <div className="text-center">
          <p className="mb-4">{t('booking.authModal.message')}</p> {/* Use translation key */}
          <div className="flex justify-center space-x-4">
            <Link
              to={`/login?redirect=${location.pathname}${location.search}`} // Redirect back after login
              className="px-4 py-2 bg-[#D4AF37] text-white rounded hover:bg-[#B4941F]" // Update button color
              onClick={() => setShowAuthModal(false)} // Close modal on click
            >
              {t('navigation.login')} {/* Use translation key */}
            </Link>
            <Link
              to={`/register?redirect=${location.pathname}${location.search}`} // Redirect back after register
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" // Keep register distinct, maybe gray?
              onClick={() => setShowAuthModal(false)} // Close modal on click
            >
              {t('navigation.register')} {/* Use translation key */}
            </Link>
          </div>
        </div>
      </Modal>
    </div> // This closes the outer bg-gray-50 div
  );
};

// Export the component
export { BookingPortal }; // Use named export
