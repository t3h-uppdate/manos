import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx'; // Added .tsx extension
// import Header from './Header'; // Optional: Add a header later if needed

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
        {/* Optional Header */}
        {/* <Header toggleSidebar={toggleSidebar} /> */}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
