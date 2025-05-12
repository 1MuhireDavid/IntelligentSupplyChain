import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AdminSidebar from "@/components/layout/admin-sidebar";
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
  Clock
} from "lucide-react";
import { useState } from "react";
import { Redirect } from "wouter";
import Sidebar from "@/components/layout/sidebar";

// Define TypeScript interfaces
interface User {
    username: string;
    password: string;
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
  totalUsers: number;
  totalDocuments: number;
  activeSessions: number;
  systemAlerts: number;
}

interface ActivityItem {
  action: string;
  description: string;
  user: string;
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

interface DashboardData {
  stats: Stats;
  activities: ActivityItem[];
  systemStatus: SystemStatusItem[];
  alerts: AlertItem[];
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
        <p className="text-sm font-medium">{activity.description}</p>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{activity.user}</span>
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
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
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
      <p className="text-sm">{message}</p>
    </div>
  );
};

// Dashboard Stats Section
interface DashboardStatsProps {
  stats: Stats;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total Users" 
        value={stats.totalUsers} 
        icon={<Users size={20} className="text-blue-500" />} 
        color="blue" 
      />
      <StatsCard 
        title="Documents" 
        value={stats.totalDocuments} 
        icon={<FileText size={20} className="text-green-500" />} 
        color="green" 
      />
      <StatsCard 
        title="Active Sessions" 
        value={stats.activeSessions} 
        icon={<Activity size={20} className="text-purple-500" />} 
        color="purple" 
      />
      <StatsCard 
        title="System Alerts" 
        value={stats.systemAlerts} 
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
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, isLoading }) => {
  const [visibleActivities, setVisibleActivities] = useState<number>(5);

  const loadMore = (): void => {
    setVisibleActivities(prev => prev + 5);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Activities</h2>
        <div className="flex items-center text-sm text-blue-500">
          <Calendar size={16} className="mr-1" />
          Last 24 hours
        </div>
      </div>
      <div className="space-y-1 divide-y divide-gray-100">
        {activities.slice(0, visibleActivities).map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </div>
      {visibleActivities < activities.length && (
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
}

const SystemStatus: React.FC<SystemStatusProps> = ({ statuses }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-4">System Status</h2>
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
  
  // Check authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (user.role !== "admin" && user.role !== "superadmin") {
    return <Redirect to="/login" />;
  }

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dataLoading } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      // In a real app, you'd fetch this from your API
      return {
        stats: {
          totalUsers: 1249,
          totalDocuments: 832,
          activeSessions: 67,
          systemAlerts: 3
        },
        activities: [
          {
            action: 'user_created',
            description: 'New user John Doe was created',
            user: 'admin@example.com',
            timestamp: '2025-05-05T10:30:00Z'
          },
          {
            action: 'document_approved',
            description: 'Document "Annual Report 2024" was approved',
            user: 'manager@example.com',
            timestamp: '2025-05-05T09:45:00Z'
          },
          {
            action: 'login_failed',
            description: 'Failed login attempt for user marketing@example.com',
            user: 'System',
            timestamp: '2025-05-05T08:20:00Z'
          },
          {
            action: 'role_updated',
            description: 'User Sarah Johnson was promoted to Manager',
            user: 'admin@example.com',
            timestamp: '2025-05-05T07:15:00Z'
          },
          {
            action: 'document_uploaded',
            description: 'New document "Q2 Financial Report" was uploaded',
            user: 'finance@example.com',
            timestamp: '2025-05-04T23:10:00Z'
          },
          {
            action: 'document_rejected',
            description: 'Document "Marketing Proposal" was rejected',
            user: 'director@example.com',
            timestamp: '2025-05-04T22:30:00Z'
          },
          {
            action: 'user_updated',
            description: 'User Michael Brown updated their profile',
            user: 'michael.brown@example.com',
            timestamp: '2025-05-04T21:05:00Z'
          },
          {
            action: 'user_deleted',
            description: 'User account for temp@example.com was deleted',
            user: 'admin@example.com',
            timestamp: '2025-05-04T20:45:00Z'
          }
        ],
        systemStatus: [
          { name: 'API Services', status: 'operational', lastUpdated: '5 min ago' },
          { name: 'Database', status: 'operational', lastUpdated: '15 min ago' },
          { name: 'Authentication', status: 'operational', lastUpdated: '30 min ago' },
          { name: 'Storage Service', status: 'degraded', lastUpdated: '1 hour ago' },
          { name: 'Email Service', status: 'operational', lastUpdated: '2 hours ago' }
        ],
        alerts: [
          { type: 'warning', message: 'Storage service is experiencing degraded performance.' },
          { type: 'info', message: 'System maintenance scheduled for May 10, 2025 at 02:00 UTC.' }
        ]
      } as DashboardData;
    }
  });

  if (dataLoading || !dashboardData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex justify-center items-center flex-1">
            <Loader2 className="animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* {dashboardData.alerts && dashboardData.alerts.length > 0 && (
              <div className="space-y-3 mb-8">
                {dashboardData.alerts.map((alert, index) => (
                  <Alert key={index} type={alert.type} message={alert.message} />
                ))}
              </div>
            )} */}
            
            {/* Stats Cards */}
            <DashboardStats stats={dashboardData.stats} />
            
            {/* Two Column Layout for Activities and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivities 
                  activities={dashboardData.activities} 
                  isLoading={dataLoading} 
                />
              </div>
              <div>
                <SystemStatus statuses={dashboardData.systemStatus} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;