import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ShippingMap from "@/components/dashboard/shipping-map";
import SupplyChainTable from "@/components/dashboard/supply-chain-table";

export default function SupplyChain() {
  const { data: shippingRoutes, isLoading } = useQuery({
    queryKey: ["/api/shipping-routes"],
  });

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
                      <Button variant="outline" className="mt-2 md:mt-0">Run Optimization</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="active">
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
                        <div className="text-center py-12 text-neutral-500">
                          Run optimization analysis to see proposed route improvements
                        </div>
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
