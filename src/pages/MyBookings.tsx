import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
// Import booking type and API function to fetch customer bookings
import { DetailedBooking, fetchBookingsByCustomerId } from '../lib/bookingApi';
// Import AuthContext to get current user ID
import { useAuth } from '../hooks/useAuth'; // Corrected import path

// DetailedBooking type is now imported from bookingApi.ts

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Use AuthContext
  const [upcomingBookings, setUpcomingBookings] = useState<DetailedBooking[]>([]);
  const [pastBookings, setPastBookings] = useState<DetailedBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMyBookings = useCallback(async () => {
    // Get actual user ID from context
    // Note: Supabase uses UUIDs for user IDs, ensure your customer_id column in bookings matches this type or handle appropriately.
    // Assuming user.id is the correct foreign key for the bookings table.
    const customerId = user?.id;

    if (!customerId) {
      // Use a more specific key if available, or keep this generic one
      setError(t('my_bookings.errors.not_logged_in', 'User not identified. Please log in to view your bookings.')); // TODO: Add translation
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch bookings using the actual customer ID (which should be a UUID string from Supabase Auth)
      // We might need to adjust fetchBookingsByCustomerId if the customer_id column type is different (e.g., integer)
      // For now, assuming it expects the user ID directly.
      // If customer_id in bookings *is* the auth user ID (UUID string) for now.
      const allBookings = await fetchBookingsByCustomerId(customerId); // Use actual API call - Removed 'as any' cast

      // Filter bookings into upcoming and past
      const now = new Date();
      const upcoming = allBookings
        .filter(b => new Date(b.end_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()); // Ascending for upcoming
      const past = allBookings
        .filter(b => new Date(b.end_time) < now)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()); // Descending for past

      setUpcomingBookings(upcoming);
      setPastBookings(past);

    } catch (err: unknown) { // Use unknown for catch block
      const message = t('my_bookings.errors.load_failed', 'Failed to load your bookings.'); // TODO: Add translation
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t, user]); // Add user to dependencies

  useEffect(() => {
    loadMyBookings();
  }, [loadMyBookings]);

  // Helper function to format date/time
  const formatDateTime = (dateTimeString: string) => {
    try {
      return new Intl.DateTimeFormat(navigator.language, { // Use browser locale
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(dateTimeString));
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateTimeString; // Fallback
    }
  };


  if (loading) return <div className="container mx-auto px-4 py-8">{t('common.loading')}</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;

  // Helper component for rendering a single booking card
  const BookingCard: React.FC<{ booking: DetailedBooking }> = ({ booking }) => (
    <div key={booking.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
      {/* Use joined service name */}
      <h2 className="text-xl font-semibold text-indigo-700 mb-2">{booking.services?.name || t('my_bookings.unknown_service', 'Service Details Unavailable')}</h2> {/* TODO: Add translation */}
      <p className="text-gray-700">
        <span className="font-medium">{t('my_bookings.labels.time', 'Time')}:</span> {formatDateTime(booking.start_time)} - {formatDateTime(booking.end_time).split(', ')[1]} {/* Show only time for end */}
      </p>
      {/* Display staff if available */}
      {booking.staff?.name && (
        <p className="text-gray-700">
          <span className="font-medium">{t('my_bookings.labels.staff', 'With')}:</span> {booking.staff.name} {/* TODO: Add translation */}
        </p>
      )}
      <p className="text-gray-700">
        <span className="font-medium">{t('my_bookings.labels.status', 'Status')}:</span> {booking.status} {/* TODO: Consider translating status */}
      </p>
      {/* TODO: Add Cancel/Reschedule buttons for future bookings? */}
    </div>
  );

  // Apply bg-gray-50 to the outermost div and add the standard container
  return (
    <div className="bg-gray-50 flex-grow"> {/* Use flex-grow if needed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Apply Contact page title style */}
        <h1 className="text-4xl font-serif text-center mb-12">{t('my_bookings.title', 'My Bookings')}</h1> {/* TODO: Add translation */}

        {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
          // Style the 'no bookings' message container like a card
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">{t('my_bookings.no_bookings', 'You have no upcoming or past bookings.')}</p> {/* TODO: Add translation */}
          </div>
        ) : (
          <div className="space-y-8"> {/* Keep the spacing between sections */}
            {/* Upcoming Bookings Section - Wrap in card style */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('my_bookings.upcoming_title', 'Upcoming Bookings')}</h2> {/* TODO: Add translation */}
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <p className="text-gray-500">{t('my_bookings.no_upcoming', 'You have no upcoming bookings.')}</p> // TODO: Add translation
              )}
            </div>

            {/* Past Bookings Section - Wrap in card style */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('my_bookings.past_title', 'Past Bookings')}</h2> {/* TODO: Add translation */}
              {pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
                </div>
              ) : (
                <p className="text-gray-500">{t('my_bookings.no_past', 'You have no past bookings.')}</p> // TODO: Add translation
              )}
            </div>
          </div>
        )}
      </div> {/* Close standard container */}
    </div> // Close outermost div
  );
};

export default MyBookings;
