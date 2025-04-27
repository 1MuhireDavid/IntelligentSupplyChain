import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityLog } from '@shared/schema';

interface RecentActivitiesProps {
  activities?: ActivityLog[];
}

// Icon mapping based on activity type
const typeIconMap = {
  shipping: 'local_shipping',
  weather: 'warning',
  market: 'trending_up',
  document: 'description',
  default: 'info'
};

// Color mapping based on activity type
const typeColorMap = {
  shipping: 'bg-primary-50 border-primary',
  weather: 'bg-warning-50 border-warning',
  market: 'bg-accent-50 border-accent',
  document: 'bg-neutral-100 border-neutral-600',
  default: 'bg-neutral-100 border-neutral-600'
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="border-neutral-100 mb-6">
        <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">View All</Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-neutral-500">
            No recent activities found.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format timestamp function
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    // For older activities, just return the date
    return activityTime.toLocaleDateString();
  };

  return (
    <Card className="border-neutral-100 mb-6">
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">View All</Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-0 left-5 bottom-0 w-0.5 bg-neutral-100"></div>
          
          {/* Timeline Items */}
          <div className="space-y-6">
            {activities.map((activity) => {
              const activityType = activity.type as keyof typeof typeIconMap || 'default';
              const icon = typeIconMap[activityType] || typeIconMap.default;
              const colorClass = typeColorMap[activityType] || typeColorMap.default;
              
              return (
                <div key={activity.id} className="flex">
                  <div className="flex-shrink-0 z-10">
                    <div className={`w-10 h-10 rounded-full ${colorClass} border-2 border-white flex items-center justify-center text-${activityType === 'default' ? 'neutral' : activityType}-500`}>
                      <span className="material-icons">{icon}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-neutral-800 font-medium">{activity.title}</h3>
                      <span className="text-xs text-neutral-500">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">{activity.description}</p>
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" className="text-primary">View Details</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
