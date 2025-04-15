import { supabase } from './supabaseClient';

export interface DashboardSummaryCounts {
  bookingsToday: number | null;
  totalCustomers: number | null; // Keeping this for now, will replace usage later
  newMessages: number | null;
  upcomingAppointments24h: number | null; // New metric
}

// Fetches the summary counts for the dashboard
export const fetchDashboardSummaryCounts = async (): Promise<DashboardSummaryCounts> => {
  // Get date ranges
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const next24hStart = new Date(now); // From now
  const next24hEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // To 24 hours from now

  try {
    // Fetch counts concurrently
    const [
      { count: bookingsTodayCount, error: bookingsError },
      { count: totalCustomersCount, error: customersError },
      { count: newMessagesCount, error: messagesError },
      { count: upcomingAppointmentsCount, error: upcomingError },
    ] = await Promise.all([
      // Bookings today
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString()),
      // Total customers (will be replaced in component usage later)
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true }),
      // New messages
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread'),
      // Upcoming appointments (next 24h) - Added Query
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', next24hStart.toISOString())
        .lte('start_time', next24hEnd.toISOString())
        // Optionally filter by status (e.g., only 'confirmed')
        // .in('status', ['confirmed', 'pending'])
    ]);

    // Basic error handling (can be enhanced)
    if (bookingsError) throw bookingsError;
    if (customersError) throw customersError;
    if (messagesError) throw messagesError;
    if (upcomingError) throw upcomingError;

    return {
      bookingsToday: bookingsTodayCount,
      totalCustomers: totalCustomersCount, // Still fetching, but won't use in UI
      newMessages: newMessagesCount,
      upcomingAppointments24h: upcomingAppointmentsCount,
    };
  } catch (err: unknown) {
    console.error("Error fetching dashboard counts:", err);
    // Log the specific error message if available
    if (err instanceof Error) {
      console.error("Error details:", err.message);
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      console.error("Error details:", err.message);
    }
    // Return nulls or rethrow depending on desired error handling
    return {
      bookingsToday: null,
      totalCustomers: null,
      newMessages: null,
      upcomingAppointments24h: null,
    };
  }
};

// TODO: Add function to fetch recent activity (e.g., last 5 bookings)
