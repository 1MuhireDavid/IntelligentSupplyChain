import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { 
  Loader2, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  RefreshCw,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import axios from "axios";

// Define TypeScript interfaces
interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    company?: string;
    role: "trader" | "admin" | "superadmin";
    createdAt: Date;
    lastLogin?: Date;
    isActive: boolean;
    permissions: {
      canManageUsers: boolean;
      canViewAnalytics: boolean;
      canManageMarketData: boolean;
      canApproveDocuments: boolean;
    };
}

interface Stats {
  users: {
    total: number;
    traders: number;
    admins: number;
    superAdmins: number;
    newInLastMonth: number;
  };
  data: {
    marketData: number;
    shippingRoutes: number;
    customsDocuments: number;
  };
  customs: {
    pending: number;
    approved: number;
    rejected: number;
  };
  activity: {
    today: number;
    weekly: number;
  };
}

interface ActivityItem {
  _id: string;
  userId: {
    username: string;
    fullName: string;
    role: string;
  };
  action: string;
  details: string;
  timestamp: string;
}

interface SystemStatusItem {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  lastUpdated: string;
}

interface AlertItem {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
interface ActivityItemProps {
  activity: ActivityItem;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActionIcon = (action: string): React.ReactNode => {
    switch (action) {
      case 'user_created':
        return <Users size={16} className="text-green-500" />;
      case 'user_updated':
        return <Users size={16} className="text-blue-500" />;
      case 'user_deleted':
        return <Users size={16} className="text-red-500" />;
      case 'role_updated':
        return <Users size={16} className="text-purple-500" />;
      case 'document_approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'document_rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'document_uploaded':
        return <FileText size={16} className="text-blue-500" />;
      case 'login_failed':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className="p-2 rounded-full bg-gray-100">
        {getActionIcon(activity.action)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.details}</p>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{activity.userId?.username || 'System'}</span>
          <span className="mx-1">•</span>
          <span>{formatTimestamp(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

// Alert Component
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onDismiss }) => {
  const alertStyles: Record<string, string> = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200"
  };

  const alertIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle size={20} className="text-green-500" />,
    warning: <AlertTriangle size={20} className="text-yellow-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    info: <Activity size={20} className="text-blue-500" />
  };

  return (
    <div className={`flex items-center p-4 rounded-md border ${alertStyles[type]}`}>
      <div className="mr-3">
        {alertIcons[type]}
      </div>
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700">
          <XCircle size={16} />
        </button>
      )}
    </div>
  );
};

// Dashboard Stats Section
interface DashboardStatsProps {
  stats: Stats;
  isLoading: boolean;
  error: Error | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading, error }) => {
  if (error) {
    return (
      <div className="mb-8">
        <Alert 
          type="error" 
          message={`Failed to load statistics: ${error.message}`} 
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total Users" 
        value={stats.users.total} 
        icon={<Users size={20} className="text-blue-500" />} 
        color="blue" 
      />
      <StatsCard 
        title="Documents" 
        value={stats.data.customsDocuments} 
        icon={<FileText size={20} className="text-green-500" />} 
        color="green" 
      />
      <StatsCard 
        title="Today's Activity" 
        value={stats.activity.today} 
        icon={<Activity size={20} className="text-purple-500" />} 
        color="purple" 
      />
      <StatsCard 
        title="Pending Approvals" 
        value={stats.customs.pending} 
        icon={<AlertTriangle size={20} className="text-red-500" />} 
        color="red" 
      />
    </div>
  );
};

// Recent Activities Section
interface RecentActivitiesProps {
  activities: ActivityItem[];
  isLoading: boolean;
  error: Error | null;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, isLoading, error }) => {
  const [visibleActivities, setVisibleActivities] = useState<number>(5);
  const [filter, setFilter] = useState<string>("all");

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(activity => activity.action.includes(filter));

  const loadMore = (): void => {
    setVisibleActivities(prev => prev + 5);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Alert 
          type="error" 
          message={`Failed to load activities: ${error.message}`} 
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Activities</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-1" />
            Loading...
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 py-3">
              <div className="animate-pulse flex space-x-4 w-full">
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Activities</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Filter size={16} className="mr-1 text-gray-500" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-none focus:ring-0 text-gray-500"
            >
              <option value="all">All Activities</option>
              <option value="user">User Activities</option>
              <option value="document">Document Activities</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-blue-500">
            <Calendar size={16} className="mr-1" />
            Last 24 hours
          </div>
        </div>
      </div>
      <div className="space-y-1 divide-y divide-gray-100">
        {filteredActivities.length === 0 ? (
          <p className="py-4 text-center text-gray-500">No activities found</p>
        ) : (
          filteredActivities.slice(0, visibleActivities).map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))
        )}
      </div>
      {visibleActivities < filteredActivities.length && (
        <button 
          onClick={loadMore}
          className="flex items-center justify-center w-full mt-4 py-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          Load more
          <ArrowRight size={16} className="ml-1" />
        </button>
      )}
    </div>
  );
};

// System Status Component
interface SystemStatusProps {
  statuses: SystemStatusItem[];
  isLoading: boolean;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ statuses, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">System Status</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">System Status</h2>
        <button className="text-sm text-blue-500 flex items-center">
          <RefreshCw size={14} className="mr-1" />
          Refresh
        </button>
      </div>
      <div className="space-y-4">
        {statuses.map((status, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              {status.status === 'operational' ? (
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              ) : status.status === 'degraded' ? (
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              )}
              <span className="text-sm font-medium">{status.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              <Clock size={14} className="inline mr-1" />
              {status.lastUpdated}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const auth = useAuth();
  const user = auth.user as User | null;
  const authLoading = auth.isLoading;
  const queryClient = useQueryClient();
  
  // System alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if token exists in localStorage
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  // Define system status
  const [systemStatuses, setSystemStatuses] = useState<SystemStatusItem[]>([
    { name: 'API Services', status: 'operational', lastUpdated: '5 min ago' },
    { name: 'Database', status: 'operational', lastUpdated: '15 min ago' },
    { name: 'Authentication', status: 'operational', lastUpdated: '30 min ago' },
    { name: 'Storage Service', status: 'operational', lastUpdated: '1 hour ago' },
    { name: 'Email Service', status: 'operational', lastUpdated: '2 hours ago' }
  ]);

  // Configure axios defaults with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setAuthError("No authentication token found. Please log in again.");
    }
  }, [token]);

  // Add authentication error event listener
  useEffect(() => {
    const handleAuthError = (error: any) => {
      if (error.response && error.response.status === 401) {
        setAuthError("Your session has expired. Please log in again.");
        localStorage.removeItem('token'); // Clear invalid token
        setToken(null);
      }
    };

    // Add interceptor to handle auth errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          handleAuthError(error);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove interceptor when component unmounts
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Fetch statistics
  const { 
    data: statsData, 
    isLoading: statsLoading,
    error: statsError
  } = useQuery<Stats, Error>({
    queryKey: ['admin-statistics'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/admin/statistics');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Handle unauthorized error
          setSystemStatuses(prev => {
            const newStatuses = [...prev];
            const authServiceIndex = newStatuses.findIndex(s => s.name === 'Authentication');
            if (authServiceIndex !== -1) {
              newStatuses[authServiceIndex] = {
                ...newStatuses[authServiceIndex],
                status: 'down',
                lastUpdated: 'just now'
              };
            }
            return newStatuses;
          });
        }
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: !!token && !authError, // Only run if token exists and no auth error
  });

  // Fetch activities
  const { 
    data: activitiesData, 
    isLoading: activitiesLoading,
    error: activitiesError
  } = useQuery<ActivityItem[], Error>({
    queryKey: ['admin-activities'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/activities');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!token && !authError, // Only run if token exists and no auth error
  });

  // Handler to dismiss auth error and redirect to login
  const handleDismissAuthError = () => {
    auth.logout();
    window.location.href = '/login';
  };

  // Check services and update status
  useEffect(() => {
    const checkServices = async () => {
      try {
        // This would be real API health checks in a production app
        // For now, we'll simulate some service issues occasionally
        const random = Math.random();
        if (random > 0.8) {
          // Simulate a service issue 20% of the time
          setSystemStatuses(prev => {
            const newStatuses = [...prev];
            const serviceIndex = Math.floor(Math.random() * newStatuses.length);
            newStatuses[serviceIndex] = {
              ...newStatuses[serviceIndex],
              status: random > 0.95 ? 'down' : 'degraded',
              lastUpdated: 'just now'
            };
            
            // Add an alert for the degraded service
            if (newStatuses[serviceIndex].status !== 'operational') {
              setAlerts(prev => [
                {
                  type: newStatuses[serviceIndex].status === 'down' ? 'error' : 'warning',
                  message: `${newStatuses[serviceIndex].name} is experiencing issues.`
                },
                ...prev
              ]);
            }
            
            return newStatuses;
          });
        }
      } catch (error) {
        console.error("Error checking services:", error);
      }
    };

    // Initial check
    checkServices();
    
    // Set up interval for service checks
    const interval = setInterval(checkServices, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Check authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }
  
  // Redirect if user is not admin
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Authentication Error */}
            {authError && (
              <div className="mb-8">
                <Alert 
                  type="error" 
                  message={authError} 
                  onDismiss={handleDismissAuthError}
                />
              </div>
            )}
            
            {/* System Alerts */}
            {alerts.length > 0 && !authError && (
              <div className="space-y-3 mb-8">
                {alerts.slice(0, 3).map((alert, index) => (
                  <Alert 
                    key={index} 
                    type={alert.type} 
                    message={alert.message} 
                    onDismiss={() => {
                      setAlerts(prev => prev.filter((_, i) => i !== index));
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Stats Cards */}
            <DashboardStats 
              stats={statsData || {
                users: { total: 0, traders: 0, admins: 0, superAdmins: 0, newInLastMonth: 0 },
                data: { marketData: 0, shippingRoutes: 0, customsDocuments: 0 },
                customs: { pending: 0, approved: 0, rejected: 0 },
                activity: { today: 0, weekly: 0 }
              }} 
              isLoading={statsLoading}
              error={statsError as Error | null}
            />
            
            {/* Two Column Layout for Activities and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivities 
                  activities={activitiesData || []} 
                  isLoading={activitiesLoading}
                  error={activitiesError as Error | null}
                />
              </div>
              <div>
                <SystemStatus 
                  statuses={systemStatuses} 
                  isLoading={false} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;