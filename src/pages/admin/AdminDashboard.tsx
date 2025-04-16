import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchDashboardSummaryCounts, fetchBookingTrends, DashboardSummaryCounts, BookingTrends } from '../../lib/dashboardApi';
import DashboardStats from '../../components/admin/DashboardStats';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, MessageSquare, Users, Clock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<DashboardSummaryCounts>({
    bookingsToday: null,
    totalCustomers: null,
    newMessages: null,
    upcomingAppointments24h: null,
  });
  const [bookingTrends, setBookingTrends] = useState<BookingTrends>({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryCounts, trends] = await Promise.all([
          fetchDashboardSummaryCounts(),
          fetchBookingTrends()
        ]);
        
        setCounts(summaryCounts);
        setBookingTrends(trends);
        
        if (Object.values(summaryCounts).some(count => count === null)) {
          setError(t('admin.dashboard.errors.fetch'));
        }
      } catch (err: unknown) {
        console.error("Error loading dashboard data:", err);
        let errorMessage = t('admin.dashboard.errors.fetch');
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [t]);

  const renderCount = (count: number | null) => {
    if (loading) return <LoadingSpinner size={20} className="text-gray-400" />;
    if (count === null) return <span className="text-red-500">{t('common.error_indicator')}</span>;
    return count;
  };

  // Skeleton Card Component
  const SkeletonStatCard: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div> {/* Skeleton for title */}
          <div className="h-8 bg-gray-300 rounded w-1/2"></div> {/* Skeleton for count */}
        </div>
        <div className="h-6 w-6 bg-gray-300 rounded-full"></div> {/* Skeleton for icon */}
      </div>
    </div>
  );


  const StatCard: React.FC<{
    title: string;
    count: number | null;
    icon: React.ReactNode;
    to?: string;
  }> = ({ title, count, icon, to }) => {
    const content = (
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {renderCount(count)}
            </p>
          </div>
          <div className="text-indigo-600">
            {icon}
          </div>
        </div>
      </div>
    );

    return to ? (
      <Link to={to} className="block">
        {content}
      </Link>
    ) : (
      content
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">{t('admin.dashboard.title')}</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              title={t('admin.dashboard.card.bookings_today')}
              count={counts.bookingsToday}
              icon={<Calendar size={24} />}
              to="/admin/bookings"
            />
            <StatCard
              title={t('admin.dashboard.card.upcoming_appointments_24h')}
              count={counts.upcomingAppointments24h}
              icon={<Clock size={24} />}
              to="/admin/calendar"
            />
            <StatCard
              title={t('admin.dashboard.card.total_customers')}
              count={counts.totalCustomers}
              icon={<Users size={24} />}
              to="/admin/customers"
            />
            <StatCard
              title={t('admin.dashboard.card.new_messages')}
              count={counts.newMessages}
              icon={<MessageSquare size={24} />}
              to="/admin/messages"
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <DashboardStats 
          bookingTrends={bookingTrends}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
