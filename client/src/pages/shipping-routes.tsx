import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import ShippingMap from "@/components/dashboard/shipping-map";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ShippingRoutes() {
  const { data: shippingRoutes, isLoading } = useQuery({
    queryKey: ["/api/shipping-routes"],
  });
  const { toast } = useToast();
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    distance: 0,
    transportMode: "sea",
    transitTime: 0,
    cost: 0,
    carbonFootprint: 0,
    efficiency: 80,
    status: "active"
  });
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name.includes("distance") || name.includes("transitTime") || 
                                        name.includes("cost") || name.includes("carbonFootprint") || 
                                        name.includes("efficiency") ? Number(value) : value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Add shipping route mutation
  const addRouteMutation = useMutation({
    mutationFn: async (routeData) => {
      const response = await apiRequest("POST", "/api/shipping-routes", routeData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Route Added",
        description: "New shipping route successfully created.",
      });
      setIsAddDialogOpen(false);
      setFormData({
        origin: "",
        destination: "",
        distance: 0,
        transportMode: "sea",
        transitTime: 0,
        cost: 0,
        carbonFootprint: 0,
        efficiency: 80,
        status: "active"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-routes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add shipping route: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    addRouteMutation.mutate(formData);
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
                  <h1 className="text-2xl font-bold text-neutral-800">Shipping Routes</h1>
                  <p className="mt-1 text-neutral-600">Interactive mapping of global shipping routes</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <Button className="bg-primary text-white" onClick={() => setIsAddDialogOpen(true)}>
                    <span className="mr-1">+</span> New Route
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Global Shipping Routes Map</CardTitle>
                    <CardDescription>Interactive view of your active shipping routes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <ShippingMap routes={shippingRoutes} fullSize={true} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {shippingRoutes?.map((route) => (
                        <span key={route._id} className="px-3 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full whitespace-nowrap">
                          {route.origin} - {route.destination}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Comparison</CardTitle>
                      <CardDescription>Compare efficiency of different routes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Cost per Distance ($/km)</h3>
                          <div className="space-y-3">
                            {shippingRoutes?.slice(0, 4).map((route) => (
                              <div key={route._id}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{route.origin} to {route.destination}</span>
                                  <span className="text-sm">${(route.cost / route.distance).toFixed(2)}/km</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2" 
                                    style={{ width: `${100 - (route.cost / route.distance) * 20}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Transit Time</h3>
                          <div className="space-y-3">
                            {shippingRoutes?.slice(0, 4).map((route) => (
                              <div key={route.id}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{route.origin} to {route.destination}</span>
                                  <span className="text-sm">{route.transitTime.toFixed(1)} days</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div 
                                    className="bg-info rounded-full h-2" 
                                    style={{ width: `${100 - route.transitTime * 10}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Efficiency</CardTitle>
                      <CardDescription>Overall efficiency of your shipping routes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {shippingRoutes?.slice(0, 3).map((route) => (
                          <div key={route.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{route.origin} to {route.destination}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                route.efficiency > 85 ? 'bg-success bg-opacity-10 text-success' :
                                route.efficiency > 70 ? 'bg-warning bg-opacity-10 text-warning' :
                                'bg-error bg-opacity-10 text-error'
                              }`}>
                                {route.efficiency}% Efficient
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div className="text-center">
                                <p className="text-xs text-neutral-500">Distance</p>
                                <p className="font-medium">{route.distance} km</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-neutral-500">Transit Time</p>
                                <p className="font-medium">{route.transitTime.toFixed(1)} days</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-neutral-500">Cost</p>
                                <p className="font-medium">${route.cost}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button variant="outline" size="sm">Optimize Route</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Transportation Partners</CardTitle>
                    <CardDescription>Logistics companies you work with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border p-4 rounded-lg flex flex-col items-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                          <span className="material-icons text-primary-500">flight</span>
                        </div>
                        <h3 className="font-medium">AirCargo Express</h3>
                        <p className="text-sm text-neutral-600 mt-1 text-center">Air freight specialists</p>
                        <div className="mt-3">
                          <Button variant="outline" size="sm">Contact</Button>
                        </div>
                      </div>
                      
                      <div className="border p-4 rounded-lg flex flex-col items-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                          <span className="material-icons text-secondary-500">directions_boat</span>
                        </div>
                        <h3 className="font-medium">OceanTrade Shipping</h3>
                        <p className="text-sm text-neutral-600 mt-1 text-center">Sea freight experts</p>
                        <div className="mt-3">
                          <Button variant="outline" size="sm">Contact</Button>
                        </div>
                      </div>
                      
                      <div className="border p-4 rounded-lg flex flex-col items-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                          <span className="material-icons text-accent-500">local_shipping</span>
                        </div>
                        <h3 className="font-medium">RoadFreight Solutions</h3>
                        <p className="text-sm text-neutral-600 mt-1 text-center">Road transport network</p>
                        <div className="mt-3">
                          <Button variant="outline" size="sm">Contact</Button>
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
      
      {/* Add New Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Shipping Route</DialogTitle>
            <DialogDescription>
              Create a new shipping route for your goods.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="origin" className="text-right">
                  Origin
                </Label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g., Kigali, Rwanda"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="destination" className="text-right">
                  Destination
                </Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="e.g., Mombasa, Kenya"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="distance" className="text-right">
                  Distance (km)
                </Label>
                <Input
                  id="distance"
                  name="distance"
                  type="number"
                  min="0"
                  value={formData.distance}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transportMode" className="text-right">
                  Transport Mode
                </Label>
                <Select
                  name="transportMode"
                  value={formData.transportMode}
                  onValueChange={(value) => handleSelectChange('transportMode', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sea">Sea</SelectItem>
                    <SelectItem value="air">Air</SelectItem>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="rail">Rail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transitTime" className="text-right">
                  Transit Time (days)
                </Label>
                <Input
                  id="transitTime"
                  name="transitTime"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.transitTime}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Cost (USD)
                </Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  min="0"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="carbonFootprint" className="text-right">
                  Carbon Footprint
                </Label>
                <Input
                  id="carbonFootprint"
                  name="carbonFootprint"
                  type="number"
                  min="0"
                  value={formData.carbonFootprint}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="efficiency" className="text-right">
                  Efficiency (%)
                </Label>
                <Input
                  id="efficiency"
                  name="efficiency"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.efficiency}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addRouteMutation.isPending}>
                {addRouteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Route'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
