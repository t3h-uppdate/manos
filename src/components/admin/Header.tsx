import React, { useState } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Bars3Icon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  CalendarDaysIcon, // Icon for New Booking
  UserPlusIcon,     // Icon for New Customer
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal'; // Import Modal component
import AddEditBookingForm from './AddEditBookingForm'; // Import Booking Form
import AddEditCustomerForm from './AddEditCustomerForm'; // Import Customer Form


interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean; // Need this to conditionally show hamburger
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(); // Call signOut
      navigate('/login'); // Redirect to admin login after logout
    } catch (error) {
      console.error("Sign out failed:", error); // Update error message
      // Handle logout error (e.g., show a notification)
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
      {/* Left side: Hamburger (mobile) + Title/Placeholder */}
      <div className="flex items-center">
        {/* Hamburger button for small screens - only show if sidebar isn't permanently visible */}
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-4 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Toggle sidebar"
        >
           <Bars3Icon className="h-6 w-6" />
         </button>
         {/* Title removed as requested */}
       </div>

       {/* Right side: Quick Add, Home & Logout */}
      <div className="flex items-center space-x-2 sm:space-x-4">
         {/* New Booking Button */}
         <button
           onClick={() => setIsBookingModalOpen(true)}
           className="flex items-center p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-700 rounded-md"
           title={t('admin.header.newBooking')}
         >
           <CalendarDaysIcon className="h-5 w-5" />
           <span className="ml-1 hidden sm:inline">{t('admin.header.newBooking')}</span>
         </button>

         {/* New Customer Button */}
         <button
           onClick={() => setIsCustomerModalOpen(true)}
           className="flex items-center p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-700 rounded-md"
           title={t('admin.header.newCustomer')}
         >
           <UserPlusIcon className="h-5 w-5" />
           <span className="ml-1 hidden sm:inline">{t('admin.header.newCustomer')}</span>
         </button>

         {/* Separator (Optional) */}
         <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>

         {/* Home Link */}
         <Link
           to="/"
           className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
           title={t('admin.header.homeTooltip')} // Tooltip for accessibility
         >
           <HomeIcon className="h-5 w-5" />
           <span className="ml-2 hidden sm:inline">{t('admin.header.home')}</span> {/* Hide text on very small screens */}
         </Link>

         {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700 rounded-md"
          title={t('admin.header.logoutTooltip')} // Tooltip for accessibility
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
           <span className="ml-2 hidden sm:inline">{t('admin.header.logout')}</span> {/* Hide text on very small screens */}
       </button>
      </div>

       {/* Booking Modal */}
       <Modal
         isOpen={isBookingModalOpen}
         onClose={() => setIsBookingModalOpen(false)}
         title={t('admin.header.newBookingModalTitle')}
       >
         <AddEditBookingForm
           // No bookingToEdit prop means it's an "Add" form
           onFormSubmit={() => {
             setIsBookingModalOpen(false);
             // Optionally trigger a refresh or show success toast here if needed elsewhere
           }}
           onClose={() => setIsBookingModalOpen(false)}
         />
       </Modal>

       {/* Customer Modal */}
       <Modal
         isOpen={isCustomerModalOpen}
         onClose={() => setIsCustomerModalOpen(false)}
         title={t('admin.header.newCustomerModalTitle')}
       >
         <AddEditCustomerForm
           // No customerToEdit prop means it's an "Add" form
           onFormSubmit={() => {
             setIsCustomerModalOpen(false);
             // Optionally trigger a refresh or show success toast here if needed elsewhere
           }}
           onClose={() => setIsCustomerModalOpen(false)}
         />
       </Modal>
     </header>
   );
};

export default Header;
