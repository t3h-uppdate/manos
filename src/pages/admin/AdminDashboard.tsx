import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { fetchDashboardSummaryCounts, DashboardSummaryCounts } from '../../lib/dashboardApi'; // Import new API function and type

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<DashboardSummaryCounts>({ // Use new interface
    bookingsToday: null,
    totalCustomers: null, // Still in interface, but won't be displayed
    newMessages: null,
    upcomingAppointments24h: null, // Added new metric
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const summaryCounts = await fetchDashboardSummaryCounts();
        setCounts(summaryCounts);
        // Check if any count is null, indicating an error during fetch in dashboardApi
        if (Object.values(summaryCounts).some(count => count === null)) {
             // Error is already logged in dashboardApi, set a generic error message
             setError(t('admin.dashboard.errors.fetch'));
        }
      } catch (err: unknown) { // Catch errors re-thrown from dashboardApi (if any)
        console.error("Error loading dashboard data:", err);
        // Type guard for error message
        let errorMessage = t('admin.dashboard.errors.fetch');
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
        setError(errorMessage);
        // Ensure counts are reset or set to null on error
        setCounts({
            bookingsToday: null,
            totalCustomers: null,
            newMessages: null,
            upcomingAppointments24h: null,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData(); // Corrected function call
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Adjusted grid columns */}
        {/* Bookings Today Card (Clickable) */}
        <Link to="/admin/bookings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 block">
          <h2 className="text-lg font-medium text-gray-600">{t('admin.dashboard.card.bookings_today')}</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {renderCount(counts.bookingsToday)}
          </p>
        </Link>

        {/* Upcoming Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h2 className="text-lg font-medium text-gray-600">{t('admin.dashboard.card.upcoming_appointments_24h', 'Upcoming (24h)')}</h2> {/* Added translation key */}
           <p className="text-3xl font-bold text-gray-800 mt-2">
             {renderCount(counts.upcomingAppointments24h)}
           </p>
         </div>

        {/* New Messages Card (Clickable) */}
        <Link to="/admin/messages" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 block">
          <h2 className="text-lg font-medium text-gray-600">{t('admin.dashboard.card.new_messages')}</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {renderCount(counts.newMessages)}
          </p>
        </Link>
      </div> {/* Closing grid div */}
      {/* Add more dashboard widgets here later */}
    </div> // Closing main container div
  );
};

export default AdminDashboard;
