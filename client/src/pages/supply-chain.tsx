import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ShippingMap from "@/components/dashboard/shipping-map";
import SupplyChainTable from "@/components/dashboard/supply-chain-table";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SupplyChain() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  
  const { data: shippingRoutes, isLoading } = useQuery({
    queryKey: ["/api/shipping-routes"],
  });
  
  const runOptimizationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/shipping-routes/optimize", {});
      return await res.json();
    },
    onSuccess: (data) => {
      setOptimizedRoutes(data);
      setActiveTab("proposed");
      toast({
        title: "Optimization Complete",
        description: "Route optimization analysis has been completed successfully.",
        variant: "default",
      });
      setOptimizationInProgress(false);
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: "Failed to run optimization analysis. Please try again.",
        variant: "destructive",
      });
      setOptimizationInProgress(false);
    }
  });
  
  const handleRunOptimization = () => {
    setOptimizationInProgress(true);
    
    // Simulate an optimization process with dummy data
    setTimeout(() => {
      const optimized = shippingRoutes?.map(route => ({
        ...route,
        optimizedCost: Math.round(route.cost * 0.85),
        optimizedTransitTime: Math.round(route.transitTime * 0.9),
        optimizedCarbonFootprint: Math.round(route.carbonFootprint * 0.75),
        optimizationReason: "Route recalculated using grid computing optimization algorithms. " +
          "We found alternative shipping lanes and multimodal transport options that reduce costs while maintaining delivery times."
      })) || [];
      
      setOptimizedRoutes(optimized);
      setActiveTab("proposed");
      toast({
        title: "Optimization Complete",
        description: "Route optimization analysis has been completed successfully.",
        variant: "default",
      });
      setOptimizationInProgress(false);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:pl-64 pt-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">Supply Chain Optimization</h1>
                  <p className="mt-1 text-neutral-600">Optimize your shipping routes and logistics</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <span className="mr-1">+</span> Add New Route
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Global Shipping Routes</CardTitle>
                      <CardDescription>Interactive map of your active shipping routes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ShippingMap routes={shippingRoutes} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Analytics</CardTitle>
                      <CardDescription>Performance metrics for your shipping routes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Cost Efficiency by Route</h3>
                          <div className="space-y-3">
                            {shippingRoutes?.slice(0, 3).map((route) => (
                              <div key={route.id}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{route.origin} to {route.destination}</span>
                                  <span className="text-sm">${route.cost} / {route.distance}km</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2" 
                                    style={{ width: `${route.efficiency}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Carbon Footprint by Transport Mode</h3>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-neutral-100 p-3 rounded-lg">
                              <div className="font-medium text-center">Air</div>
                              <div className="text-error text-center font-bold mt-2">High</div>
                              <div className="mt-1 text-center text-sm text-neutral-600">75%</div>
                            </div>
                            <div className="bg-neutral-100 p-3 rounded-lg">
                              <div className="font-medium text-center">Sea</div>
                              <div className="text-secondary text-center font-bold mt-2">Low</div>
                              <div className="mt-1 text-center text-sm text-neutral-600">30%</div>
                            </div>
                            <div className="bg-neutral-100 p-3 rounded-lg">
                              <div className="font-medium text-center">Road</div>
                              <div className="text-accent text-center font-bold mt-2">Medium</div>
                              <div className="mt-1 text-center text-sm text-neutral-600">50%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <CardTitle>Supply Chain Routes</CardTitle>
                        <CardDescription>Manage and optimize your shipping routes</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-2 md:mt-0"
                        onClick={handleRunOptimization}
                        disabled={optimizationInProgress}
                      >
                        {optimizationInProgress ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Optimizing...
                          </>
                        ) : "Run Optimization"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="active">Active Routes</TabsTrigger>
                        <TabsTrigger value="archived">Archived Routes</TabsTrigger>
                        <TabsTrigger value="proposed">Proposed Optimizations</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="active">
                        <SupplyChainTable routes={shippingRoutes} />
                      </TabsContent>
                      
                      <TabsContent value="archived">
                        <div className="text-center py-12 text-neutral-500">
                          No archived routes found
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="proposed">
                        {optimizedRoutes.length > 0 ? (
                          <div className="space-y-8">
                            {optimizedRoutes.map((route) => (
                              <div key={route._id} className="border rounded-lg p-4">
                                <h3 className="text-lg font-medium mb-2">{route.origin} to {route.destination}</h3>
                                <p className="text-sm text-neutral-600 mb-4">{route.optimizationReason}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div className="bg-neutral-50 p-3 rounded-md">
                                    <div className="text-sm text-neutral-500">Current Cost</div>
                                    <div className="text-lg font-medium">${route.cost}</div>
                                  </div>
                                  <div className="bg-neutral-50 p-3 rounded-md">
                                    <div className="text-sm text-neutral-500">Optimized Cost</div>
                                    <div className="text-lg font-medium text-success">${route.optimizedCost}</div>
                                    <div className="text-xs text-success">
                                      Save {Math.round((1 - route.optimizedCost/route.cost) * 100)}%
                                    </div>
                                  </div>
                                  <div className="bg-neutral-50 p-3 rounded-md">
                                    <div className="text-sm text-neutral-500">Current Transit Time</div>
                                    <div className="text-lg font-medium">{route.transitTime} days</div>
                                  </div>
                                  <div className="bg-neutral-50 p-3 rounded-md">
                                    <div className="text-sm text-neutral-500">Optimized Transit Time</div>
                                    <div className="text-lg font-medium text-success">{route.optimizedTransitTime} days</div>
                                    <div className="text-xs text-success">
                                      Save {Math.round((1 - route.optimizedTransitTime/route.transitTime) * 100)}%
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="sm">View Details</Button>
                                  <Button variant="default" size="sm">Apply Optimization</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-neutral-500">
                            Run optimization analysis to see proposed route improvements
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Weather & Risk Alerts</CardTitle>
                    <CardDescription>Potential disruptions to your supply chain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                        <div className="flex items-start">
                          <span className="material-icons text-amber-500 mr-3">warning</span>
                          <div>
                            <h3 className="font-medium">Weather Alert on Mombasa Route</h3>
                            <p className="text-sm text-neutral-600 mt-1">
                              Heavy rainfall predicted along Mombasa-Nairobi-Kigali route. 
                              Potential delays of 1-2 days expected over the next week.
                            </p>
                            <div className="mt-3">
                              <Button variant="outline" size="sm">View Alternative Routes</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex items-start">
                          <span className="material-icons text-blue-500 mr-3">info</span>
                          <div>
                            <h3 className="font-medium">Port Congestion at Dar es Salaam</h3>
                            <p className="text-sm text-neutral-600 mt-1">
                              Increased vessel traffic has led to port congestion at Dar es Salaam. 
                              Consider routing through Mombasa for the next 10 days.
                            </p>
                            <div className="mt-3">
                              <Button variant="outline" size="sm">Check Port Status</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
