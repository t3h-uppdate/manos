import React, { useState, useEffect, useLayoutEffect } from 'react'; // Import useLayoutEffect for immediate checks
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles
// Import API functions to fetch services, staff, availability, and create bookings
import { fetchStaffAvailability, AvailableSlot } from '../lib/availabilityApi'; // Import availability API and type
import { createBooking, NewBookingData } from '../lib/bookingApi'; // Import booking API and type
import { findOrCreateCustomer } from '../lib/customerApi'; // Import customer API
import { useAuth } from '../hooks/useAuth'; // Updated import path for useAuth
// Removed serviceApi import
// TODO: Import necessary types (Service, Staff, Booking etc.)
// TODO: Import components for displaying services, calendar/time slots, forms

// Removed Service type import

// Define a default duration in minutes for fetching slots and calculating end time
const DEFAULT_APPOINTMENT_DURATION = 30; // Changed from 60

const BookingPortal: React.FC = () => {
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
          const message = err instanceof Error ? err.message : "Could not load available times. Please try again later.";
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
    // No auth check needed here, will be handled before rendering step 2
    setSelectedSlot(slot);
    setStep(2); // Move to step 2 (Enter Details)
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in before submitting
    if (!user || !user.email) {
        setError("You must be logged in to book an appointment.");
        navigate('/login?redirect=/book');
        return;
    }

    // Check only for selectedSlot
    if (!selectedSlot || !selectedSlot.datetime) {
      setError("Please select a time slot.");
      return;
    }
    // Add validation for the message if required (e.g., not empty)
    if (!clientMessage.trim()) {
        setError("Please enter a message describing your needs.");
        return; // Prevent submission if message is empty
    }


    setLoading(true);
    setError(null);

    try {
      // 1. Find or Create Customer using logged-in user's details
      const customerName = user.user_metadata?.full_name || user.email.split('@')[0]; // Example fallback

      // Ensure user is non-null here (already checked at function start)
      if (!user) {
          throw new Error("User is not authenticated."); // Should not happen
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
      const message = err instanceof Error ? err.message : "Failed to create booking. Please try again.";
      setError(message);
      // Optionally add toast notification
      // toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to handle redirection *before* rendering protected steps
  // useLayoutEffect runs synchronously after DOM mutations but before paint
  useLayoutEffect(() => {
      // Only check/redirect if auth isn't loading and step requires login (Steps 2 and 3 now)
      if (!authLoading && (step === 2 || step === 3) && !user) {
          console.log("Redirecting to login from step", step);
          // Include current path as redirect target
          navigate(`/login?redirect=${location.pathname}${location.search}`);
      }
  }, [step, user, authLoading, navigate, location]); // location added

  const renderStepContent = () => {
    // Show loading indicator while checking auth state initially
    if (authLoading) {
        return <div className="text-center p-10">Authenticating...</div>;
    }

    // If we are in a protected step but the effect hasn't redirected yet (e.g., mid-render), render null
     if ((step === 2 || step === 3) && !user) {
        return null;
     }

    // Proceed with rendering steps if authenticated or if step doesn't require auth
    if (loading && step !== 1) return <div className="text-center p-10">Loading...</div>; // Show loading for steps 2/3
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;


    switch (step) {
      // Step 1 is now Select Time Slot
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Select Date & Time</h2>
            {/* Removed Back button */}

            {/* Date Picker */}
            <div className="mb-6">
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">Select Date:</label>
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
            <h3 className="text-xl font-semibold mb-3">Available Slots for {selectedDate ? selectedDate.toLocaleDateString() : 'selected date'}:</h3>
            {loading ? ( // Show loading indicator when fetching slots
                 <p>Loading slots...</p>
            ) : availableSlots.length === 0 ? (
              <p>No available slots found for this date.</p>
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
                        className="p-2 border rounded bg-gray-100 hover:bg-indigo-100 text-center text-sm"
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
            <h2 className="text-2xl font-semibold mb-4">Enter Your Details & Needs</h2>
            <button onClick={() => setStep(1)} className="mb-4 text-indigo-600 hover:underline">&larr; Back to Time Selection</button>
            {/* Removed service name */}
            <p className="mb-4">Booking appointment at <strong>{selectedSlot ? new Date(selectedSlot.datetime).toLocaleString() : ''}</strong>.</p>
            {/* Display logged-in user email */}
            <p className="mb-4 text-sm text-gray-600">Booking as: {user?.email}</p>
            <form onSubmit={handleBookingSubmit} className="space-y-4 max-w-md mx-auto">
              {/* Removed Name and Email fields */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)} // Update phone state directly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {/* Add Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message / Needs</label>
                <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    required // Make message required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Please briefly describe the service or reason for your appointment."
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50">
                {loading ? 'Booking...' : 'Confirm Booking'}
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
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Booking Request Sent!</h2>
            {/* Use user email or fetched name */}
            <p>Thank you, {user.user_metadata?.full_name || user.email}!</p>
            {/* Removed service name */}
            <p>Your appointment request for <strong>{selectedSlot ? new Date(selectedSlot.datetime).toLocaleString() : ''}</strong> has been submitted.</p>
            <p className="mt-2">We will review your request and message:</p>
            <p className="mt-1 p-2 bg-gray-100 rounded text-sm text-left italic">"{clientMessage}"</p>
            <p className="mt-4">You should receive a confirmation email shortly (feature not implemented yet).</p>
            {/* Reset state including message */}
            <button onClick={() => { setStep(1); setSelectedSlot(null); setClientPhone(''); setClientMessage(''); setSelectedDate(new Date()); }} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
              Book Another Appointment
            </button>
          </div>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Book Your Appointment</h1>
      {renderStepContent()}
    </div>
  );
};

// Export the component
export { BookingPortal }; // Use named export
