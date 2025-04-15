import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { useTranslation } from 'react-i18next'; // Import useTranslation
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ScissorsIcon, // Example icon for Services
  InboxIcon,
  CogIcon,
  UserGroupIcon, // Example icon for Staff
  ArchiveBoxIcon, // Icon for Inventory
} from '@heroicons/react/24/outline'; // Using Heroicons for icons

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void; // Function to toggle sidebar on smaller screens
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  // Basic styling, can be customized further with Tailwind
  const baseLinkClasses = "flex items-center px-4 py-2 mt-2 text-gray-600 transition-colors duration-200 transform rounded-md hover:bg-gray-200 hover:text-gray-700";
  const activeLinkClasses = "bg-gray-300 text-gray-800"; // Example active state

  // TODO: Implement logic to determine the active link based on the current route
  const isActive = (path: string) => window.location.pathname === path; // Simple example

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 px-4 py-5 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-800 dark:border-gray-700 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out md:relative md:translate-x-0`} // Responsive handling
    >
      <div className="flex items-center justify-between">
        <Link to="/admin" className="text-2xl font-semibold text-gray-800 dark:text-white">
          {t('admin.sidebar.title')}
        </Link>
        {/* Button to close sidebar on mobile - Icon only, no text to translate */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 dark:text-gray-400 focus:outline-none md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="mt-10">
        <Link to="/admin" className={`${baseLinkClasses} ${isActive('/admin') ? activeLinkClasses : ''}`}>
          <HomeIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.dashboard')}</span>
        </Link>

        <Link to="/admin/calendar" className={`${baseLinkClasses} ${isActive('/admin/calendar') ? activeLinkClasses : ''}`}>
          <CalendarIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.calendar')}</span>
        </Link>

        <Link to="/admin/bookings" className={`${baseLinkClasses} ${isActive('/admin/bookings') ? activeLinkClasses : ''}`}>
          <BriefcaseIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.bookings')}</span>
        </Link>

        <Link to="/admin/customers" className={`${baseLinkClasses} ${isActive('/admin/customers') ? activeLinkClasses : ''}`}>
          <UsersIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.customers')}</span>
        </Link>

        <Link to="/admin/inventory" className={`${baseLinkClasses} ${isActive('/admin/inventory') ? activeLinkClasses : ''}`}>
          <ArchiveBoxIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.inventory')}</span>
        </Link>

        <Link to="/admin/messages" className={`${baseLinkClasses} ${isActive('/admin/messages') ? activeLinkClasses : ''}`}>
          <InboxIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.messages')}</span>
        </Link>

        <hr className="my-6 border-gray-200 dark:border-gray-600" />

        <Link to="/admin/settings" className={`${baseLinkClasses} ${isActive('/admin/settings') ? activeLinkClasses : ''}`}>
          <CogIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.settings')}</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
