import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShippingRoute } from '@shared/schema';

interface SupplyChainTableProps {
  routes?: ShippingRoute[];
}

export default function SupplyChainTable({ routes }: SupplyChainTableProps) {
  if (!routes || routes.length === 0) {
    return (
      <Card className="border-neutral-100">
        <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <CardTitle className="text-base font-semibold">Supply Chain Optimization</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">View All</Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-neutral-500">
            No shipping routes found. Create your first route to optimize your supply chain.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-100">
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Supply Chain Optimization</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">View All</Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 text-left text-sm">
                <th className="py-2 px-3 font-medium">Route</th>
                <th className="py-2 px-3 font-medium">Mode</th>
                <th className="py-2 px-3 font-medium">Distance</th>
                <th className="py-2 px-3 font-medium">Transit Time</th>
                <th className="py-2 px-3 font-medium">Cost</th>
                <th className="py-2 px-3 font-medium">Carbon</th>
                <th className="py-2 px-3 font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {routes.map((route) => (
                <tr key={route.id} className="text-sm text-neutral-800 hover:bg-neutral-50">
                  <td className="py-3 px-3 font-medium">{route.origin} to {route.destination}</td>
                  <td className="py-3 px-3">{route.transportMode}</td>
                  <td className="py-3 px-3">{route.distance} km</td>
                  <td className="py-3 px-3">{route.transitTime.toFixed(1)} days</td>
                  <td className="py-3 px-3">${route.cost}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`rounded-full h-2 ${
                            route.carbonFootprint > 70 ? 'bg-error' : 
                            route.carbonFootprint > 40 ? 'bg-warning' : 
                            'bg-success'
                          }`} 
                          style={{ width: `${route.carbonFootprint}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-neutral-500">
                        {route.carbonFootprint > 70 ? 'High' : 
                         route.carbonFootprint > 40 ? 'Medium' : 
                         'Low'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 ${
                      route.efficiency > 85 ? 'bg-success bg-opacity-10 text-success' : 
                      route.efficiency > 70 ? 'bg-warning bg-opacity-10 text-warning' : 
                      'bg-error bg-opacity-10 text-error'
                    } text-xs rounded-full`}>
                      {route.efficiency}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="text-primary flex items-center">
            <span className="material-icons text-sm mr-1">insights</span> Run Optimization Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
