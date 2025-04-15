import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStatsProps {
  bookingTrends: {
    labels: string[];
    data: number[];
  };
  loading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ bookingTrends, loading = false }) => {
  const { t } = useTranslation();

  const chartData: ChartData<'line'> = {
    labels: bookingTrends.labels,
    datasets: [
      {
        label: t('admin.dashboard.charts.bookings_trend'),
        data: bookingTrends.data,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('admin.dashboard.charts.bookings_over_time'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DashboardStats;