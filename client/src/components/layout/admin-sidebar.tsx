import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  // Close sidebar when location changes (on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Check if user is admin or superadmin
  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");
  const isSuperAdmin = user && user.role === "superadmin";

  if (!isAdmin) {
    return null;
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-20 bg-blue-500 text-white p-2 rounded-md shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Admin Sidebar */}
      <aside 
        id="admin-sidebar" 
        className={`bg-gradient-to-b from-blue-50 to-white w-64 shadow-xl fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition duration-300 ease-in-out z-10 pt-16 border-r border-gray-100`}
        style={{ top: '61px' }}
      >
        <div className="h-full flex flex-col">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
            <h2 className="text-lg font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Admin Panel
            </h2>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-5 mb-3">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Admin Controls</p>
            </div>
            
            <Link href="/admin">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </a>
            </Link>
            
            <Link href="/admin/users">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin/users' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-medium">User Management</span>
              </a>
            </Link>
            
            {isSuperAdmin && (
              <Link href="/admin/roles">
                <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                  location === '/admin/roles' 
                    ? 'text-white bg-blue-500 shadow-md' 
                    : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Role Management</span>
                </a>
              </Link>
            )}
            
            <Link href="/admin/activities">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin/activities' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Activity Logs</span>
              </a>
            </Link>
            
            <div className="px-5 mt-6 mb-3">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Content Management</p>
            </div>
            
            <Link href="/admin/market-data">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin/market-data' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="font-medium">Market Data</span>
              </a>
            </Link>
            
            <Link href="/admin/customs">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin/customs' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Customs Approval</span>
              </a>
            </Link>
            
            <Link href="/admin/opportunities">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin/opportunities' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Opportunities</span>
              </a>
            </Link>
            
            <div className="px-5 mt-6 mb-3">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">System</p>
            </div>
            
            <Link href="/admin/settings">
              <a className={`flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 ${
                location === '/admin/settings' 
                  ? 'text-white bg-blue-500 shadow-md' 
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">System Settings</span>
              </a>
            </Link>
            
            <Link href="/">
              <a className="flex items-center px-5 py-3 rounded-r-lg my-1 mx-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Back to App</span>
              </a>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 shadow-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.028-.696-.083-1.036A4.978 4.978 0 0012 11a4.979 4.979 0 00-2-3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold text-white">{user?.role?.toUpperCase()}</span>
              </div>
              <p className="text-xs text-blue-100 mt-2">{user?.fullName}</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-30 z-0 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
}