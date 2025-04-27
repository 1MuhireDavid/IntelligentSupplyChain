import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  // Close sidebar when location changes (on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Sidebar */}
      <aside 
        id="sidebar" 
        className={`bg-white w-64 shadow-lg fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition duration-300 ease-in-out z-10 pt-16 border-r border-neutral-200`}
        style={{ top: '61px' }}
      >
        <div className="h-full flex flex-col">
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Main Navigation</p>
            </div>
            
            <Link href="/">
              <a className={`flex items-center px-4 py-3 ${
                location === '/' 
                  ? 'text-primary bg-primary-50 border-l-4 border-primary' 
                  : 'text-neutral-700 hover:bg-neutral-50 border-l-4 border-transparent'
              }`}>
                <span className="material-icons mr-3">dashboard</span>
                <span className="font-medium">Dashboard</span>
              </a>
            </Link>
            
            <Link href="/market-intelligence">
              <a className={`flex items-center px-4 py-3 ${
                location === '/market-intelligence' 
                  ? 'text-primary bg-primary-50 border-l-4 border-primary' 
                  : 'text-neutral-700 hover:bg-neutral-50 border-l-4 border-transparent'
              }`}>
                <span className="material-icons mr-3">show_chart</span>
                <span className="font-medium">Market Intelligence</span>
              </a>
            </Link>
            
            <Link href="/supply-chain">
              <a className={`flex items-center px-4 py-3 ${
                location === '/supply-chain' 
                  ? 'text-primary bg-primary-50 border-l-4 border-primary' 
                  : 'text-neutral-700 hover:bg-neutral-50 border-l-4 border-transparent'
              }`}>
                <span className="material-icons mr-3">alt_route</span>
                <span className="font-medium">Supply Chain</span>
              </a>
            </Link>
            
            <Link href="/customs-management">
              <a className={`flex items-center px-4 py-3 ${
                location === '/customs-management' 
                  ? 'text-primary bg-primary-50 border-l-4 border-primary' 
                  : 'text-neutral-700 hover:bg-neutral-50 border-l-4 border-transparent'
              }`}>
                <span className="material-icons mr-3">description</span>
                <span className="font-medium">Customs Management</span>
              </a>
            </Link>
            
            <Link href="/shipping-routes">
              <a className={`flex items-center px-4 py-3 ${
                location === '/shipping-routes' 
                  ? 'text-primary bg-primary-50 border-l-4 border-primary' 
                  : 'text-neutral-700 hover:bg-neutral-50 border-l-4 border-transparent'
              }`}>
                <span className="material-icons mr-3">map</span>
                <span className="font-medium">Shipping Routes</span>
              </a>
            </Link>
            
            <div className="mt-6 px-4 mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Account</p>
            </div>
            
            <Link href="/profile">
              <a className={`flex items-center px-4 py-3 ${
                location === '/profile' 
                  ? 'text-primary bg-primary-50 border-l-4 border-primary' 
                  : 'text-neutral-700 hover:bg-neutral-50 border-l-4 border-transparent'
              }`}>
                <span className="material-icons mr-3">person</span>
                <span className="font-medium">Profile</span>
              </a>
            </Link>
            
            <a className="flex items-center px-4 py-3 text-neutral-700 hover:bg-neutral-50 cursor-pointer">
              <span className="material-icons mr-3">settings</span>
              <span className="font-medium">Settings</span>
            </a>
            
            <a className="flex items-center px-4 py-3 text-neutral-700 hover:bg-neutral-50 cursor-pointer">
              <span className="material-icons mr-3">help_outline</span>
              <span className="font-medium">Help & Support</span>
            </a>
          </nav>
          
          <div className="p-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center">
                <span className="material-icons text-info mr-3">new_releases</span>
                <span className="text-sm font-medium">New update available</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">Version 2.4.0 has new features</p>
              <button className="mt-2 text-xs text-primary font-medium hover:text-primary-600 focus:outline-none">
                Update now
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile sidebar */}
      <div 
        className={`fixed inset-0 bg-neutral-900 bg-opacity-50 z-0 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
}
