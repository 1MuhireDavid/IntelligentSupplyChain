import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'error' | 'warning';
}

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  info: 'text-info',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning'
}

export default function MetricsCard({ title, value, change, isPositive, icon, color }: MetricsCardProps) {
  return (
    <Card className="border-neutral-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-neutral-600 text-sm font-medium">{title}</p>
          <span className={`material-icons ${colorMap[color]}`}>{icon}</span>
        </div>
        <div className="mt-2">
          <h3 className="font-inter text-2xl font-bold text-neutral-800">{value}</h3>
          <div className="flex items-center mt-1">
            <span className={`text-${isPositive ? 'success' : 'error'} text-xs flex items-center font-medium`}>
              <span className="material-icons text-xs mr-1">
                {isPositive ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {Math.abs(change)}%
            </span>
            <span className="text-neutral-500 text-xs ml-2">vs. last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
