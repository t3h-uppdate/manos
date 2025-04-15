import { supabase } from './supabaseClient';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export interface DashboardSummaryCounts {
  bookingsToday: number | null;
  totalCustomers: number | null;
  newMessages: number | null;
  upcomingAppointments24h: number | null;
}

export interface BookingTrends {
  labels: string[];
  data: number[];
}

// Fetch the summary counts for the dashboard
export const fetchDashboardSummaryCounts = async (): Promise<DashboardSummaryCounts> => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const next24hEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const [
      { count: bookingsTodayCount, error: bookingsError },
      { count: totalCustomersCount, error: customersError },
      { count: newMessagesCount, error: messagesError },
      { count: upcomingAppointmentsCount, error: upcomingError },
    ] = await Promise.all([
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString()),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread'),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', now.toISOString())
        .lte('start_time', next24hEnd.toISOString())
    ]);

    if (bookingsError) throw bookingsError;
    if (customersError) throw customersError;
    if (messagesError) throw messagesError;
    if (upcomingError) throw upcomingError;

    return {
      bookingsToday: bookingsTodayCount,
      totalCustomers: totalCustomersCount,
      newMessages: newMessagesCount,
      upcomingAppointments24h: upcomingAppointmentsCount,
    };
  } catch (err) {
    console.error("Error fetching dashboard counts:", err);
    return {
      bookingsToday: null,
      totalCustomers: null,
      newMessages: null,
      upcomingAppointments24h: null,
    };
  }
};

// Fetch booking trends for the last 7 days
export const fetchBookingTrends = async (): Promise<BookingTrends> => {
  const days = 7;
  const labels: string[] = [];
  const data: number[] = [];
  const now = new Date();

  try {
    // Fetch bookings for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString());

      if (error) throw error;

      labels.push(format(date, 'MMM d'));
      data.push(count || 0);
    }

    return { labels, data };
  } catch (err) {
    console.error("Error fetching booking trends:", err);
    // Return empty data on error
    return {
      labels: [],
      data: [],
    };
  }
};