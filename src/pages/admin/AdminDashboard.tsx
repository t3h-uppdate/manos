import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { supabase } from '../../lib/supabaseClient'; // Adjust path as needed

interface SummaryCounts {
  bookingsToday: number | null;
  totalCustomers: number | null;
  newMessages: number | null;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [counts, setCounts] = useState<SummaryCounts>({
    bookingsToday: null,
    totalCustomers: null,
    newMessages: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get today's date range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Fetch counts concurrently
        const [
          { count: bookingsTodayCount, error: bookingsError },
          { count: totalCustomersCount, error: customersError },
          { count: newMessagesCount, error: messagesError },
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
        ]);

        if (bookingsError) throw bookingsError;
        if (customersError) throw customersError;
        if (messagesError) throw messagesError;

        setCounts({
          bookingsToday: bookingsTodayCount,
          totalCustomers: totalCustomersCount,
          newMessages: newMessagesCount,
        });
      } catch (err: any) {
        console.error("Error fetching dashboard counts:", err);
        setError(err.message || t('admin.dashboard.errors.fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [t]); // Add t to dependency array

  const renderCount = (count: number | null) => {
    if (loading) return <span className="text-gray-500">{t('common.loading_indicator')}</span>;
    if (count === null) return <span className="text-red-500">{t('common.error_indicator')}</span>;
    return count;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t('admin.dashboard.title')}</h1>
      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>} {/* Error message is already translated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-600">{t('admin.dashboard.card.bookings_today')}</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {renderCount(counts.bookingsToday)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-600">{t('admin.dashboard.card.total_customers')}</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">
             {renderCount(counts.totalCustomers)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-600">{t('admin.dashboard.card.new_messages')}</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {renderCount(counts.newMessages)}
          </p>
        </div>
      </div>
      {/* Add more dashboard widgets here later */}
    </div>
  );
};

export default AdminDashboard;
