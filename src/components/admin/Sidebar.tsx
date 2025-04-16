import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Import NavLink
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

  // Enhanced styling for links
  const baseLinkClasses = "flex items-center px-4 py-2 mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-150 transform rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200";
  // Using a subtle blue for active state, adjust color as needed
  const activeLinkClasses = "bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-gray-100 font-semibold";

  // NavLink className function to apply active styles
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-800 dark:border-gray-700 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out md:relative md:translate-x-0`} // Responsive handling, removed px-4 py-5 for finer control
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-5"> {/* Added padding back here */}
        {/* Title/Logo Area */}
        <Link to="/admin" className="text-xl font-bold text-gray-800 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
          {t('admin.sidebar.title')}
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={toggleSidebar} // Keep toggle functionality
          className="text-gray-600 dark:text-gray-400 focus:outline-none md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="px-4 mt-6"> {/* Adjusted margin-top and added padding */}
        {/* Use NavLink for automatic active class handling */}
        {/* Added 'end' prop to dashboard link to prevent matching sub-routes */}
        <NavLink to="/admin" className={getNavLinkClass} end>
          <HomeIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.dashboard')}</span>
        </NavLink>

        <NavLink to="/admin/calendar" className={getNavLinkClass}>
          <CalendarIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.calendar')}</span>
        </NavLink>

        <NavLink to="/admin/bookings" className={getNavLinkClass}>
          <BriefcaseIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.bookings')}</span>
        </NavLink>

        <NavLink to="/admin/customers" className={getNavLinkClass}>
          <UsersIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.customers')}</span>
        </NavLink>

        <NavLink to="/admin/inventory" className={getNavLinkClass}>
          <ArchiveBoxIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.inventory')}</span>
        </NavLink>

        <NavLink to="/admin/services" className={getNavLinkClass}>
          <ScissorsIcon className="w-5 h-5" />
           <span className="mx-4 font-medium">{t('admin.sidebar.services')}</span>
         </NavLink>

         <NavLink to="/admin/staff" className={getNavLinkClass}>
           <UserGroupIcon className="w-5 h-5" />
           <span className="mx-4 font-medium">{t('admin.sidebar.staff')}</span>
         </NavLink>

         <NavLink to="/admin/messages" className={getNavLinkClass}>
           <InboxIcon className="w-5 h-5" />
           <span className="mx-4 font-medium">{t('admin.sidebar.messages')}</span>
        </NavLink>

        <hr className="my-6 border-gray-200 dark:border-gray-600" />

        <NavLink to="/admin/settings" className={getNavLinkClass}>
          <CogIcon className="w-5 h-5" />
          <span className="mx-4 font-medium">{t('admin.sidebar.settings')}</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
