import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-md z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <button 
              id="menu-toggle" 
              className="mr-4 text-neutral-700 lg:hidden focus:outline-none"
              onClick={toggleSidebar}
            >
              <span className="material-icons">menu</span>
            </button>
            <Link href="/">
              <a className="flex items-center">
                <span className="material-icons text-primary mr-2">account_balance</span>
                <h1 className="text-lg font-inter font-semibold text-neutral-800">Intelligent Supply Chain</h1>
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-64"
              />
              <span className="material-icons absolute left-3 top-2 text-neutral-400">search</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-neutral-100 relative">
                  <span className="material-icons text-neutral-700">notifications</span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-3 border-b hover:bg-neutral-50">
                    <div className="flex">
                      <span className="material-icons text-primary mr-3">local_shipping</span>
                      <div>
                        <p className="text-sm font-medium">Shipment #CF-2304 cleared customs</p>
                        <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-b hover:bg-neutral-50">
                    <div className="flex">
                      <span className="material-icons text-warning mr-3">warning</span>
                      <div>
                        <p className="text-sm font-medium">Weather alert on Mombasa route</p>
                        <p className="text-xs text-neutral-500 mt-1">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-neutral-50">
                    <div className="flex">
                      <span className="material-icons text-accent mr-3">trending_up</span>
                      <div>
                        <p className="text-sm font-medium">Coffee prices rising</p>
                        <p className="text-xs text-neutral-500 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t">
                  <button className="w-full text-center text-sm text-primary p-2 hover:bg-neutral-50 rounded-md">
                    View all notifications
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                    {user?.fullName 
                      ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                      : user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <span className="ml-2 font-medium text-sm hidden md:block">
                    {user?.fullName || user?.username}
                  </span>
                  <span className="material-icons text-neutral-500 ml-1 hidden md:block">arrow_drop_down</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/profile">
                    <a className="flex items-center">
                      <span className="material-icons mr-2 text-sm">person</span>
                      <span>Profile</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <span className="material-icons mr-2 text-sm">settings</span>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <span className="material-icons mr-2 text-sm">logout</span>
                  <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
