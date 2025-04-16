import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx'; // Import the new Header component

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on larger screens

  // Basic toggle logic (can be enhanced)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6"> {/* Removed relative positioning and old button */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
