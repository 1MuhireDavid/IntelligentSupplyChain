import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X } from "lucide-react";
import MarketPriceChart from "@/components/dashboard/market-price-chart";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MarketIntelligence() {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market-data"],
  });
  const { toast } = useToast();
  
  // Dialog states
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isNewAnalysisDialogOpen, setIsNewAnalysisDialogOpen] = useState(false);
  
  // Product form state
  const [productFormData, setProductFormData] = useState({
    productName: "",
    category: "coffee",
    currentPrice: 0,
    priceChange: 0,
    currency: "USD",
    marketPlace: "Global",
    historicalData: {}
  });
  
  // Analysis form state
  const [analysisFormData, setAnalysisFormData] = useState({
    title: "",
    description: "",
    productCategory: "coffee",
    marketTrend: "rising",
    insightType: "opportunity"
  });
  
  // Handle product form input changes
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({ 
      ...prev, 
      [name]: name.includes("Price") || name.includes("Change") ? Number(value) : value 
    }));
  };
  
  // Handle product form select changes
  const handleProductSelectChange = (name, value) => {
    setProductFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle analysis form input changes
  const handleAnalysisInputChange = (e) => {
    const { name, value } = e.target;
    setAnalysisFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle analysis form select changes
  const handleAnalysisSelectChange = (name, value) => {
    setAnalysisFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await apiRequest("POST", "/api/market-data", productData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Added",
        description: "New product has been added to monitoring.",
      });
      setIsAddProductDialogOpen(false);
      setProductFormData({
        productName: "",
        category: "coffee",
        currentPrice: 0,
        priceChange: 0,
        currency: "USD",
        marketPlace: "Global",
        historicalData: {}
      });
      queryClient.invalidateQueries({ queryKey: ["/api/market-data"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add product: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Add analysis mutation
  const addAnalysisMutation = useMutation({
    mutationFn: async (analysisData) => {
      const response = await apiRequest("POST", "/api/market-opportunities", {
        ...analysisData,
        score: Math.round(Math.random() * 30) + 70, // Generate a random opportunity score between 70-100
        status: "active"
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Created",
        description: "New market analysis has been created successfully.",
      });
      setIsNewAnalysisDialogOpen(false);
      setAnalysisFormData({
        title: "",
        description: "",
        productCategory: "coffee",
        marketTrend: "rising",
        insightType: "opportunity"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/market-opportunities"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create analysis: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle product form submission
  const handleProductSubmit = (e) => {
    e.preventDefault();
    addProductMutation.mutate(productFormData);
  };
  
  // Handle analysis form submission
  const handleAnalysisSubmit = (e) => {
    e.preventDefault();
    addAnalysisMutation.mutate(analysisFormData);
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
                  <h1 className="text-2xl font-bold text-neutral-800">Market Intelligence</h1>
                  <p className="mt-1 text-neutral-600">Monitor global markets and identify trading opportunities</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <Button 
                    onClick={() => setIsNewAnalysisDialogOpen(true)}
                    variant="outline" 
                    className="mr-2"
                  >
                    <span className="mr-1">+</span> New Analysis
                  </Button>
                  <Button 
                    onClick={() => setIsAddProductDialogOpen(true)}
                    className="bg-primary text-white hover:bg-primary-600"
                  >
                    <span className="mr-1">+</span> Add Product to Monitor
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
                {/* Product Categories */}
                <div className="mb-6">
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Products</TabsTrigger>
                      <TabsTrigger value="coffee">Coffee</TabsTrigger>
                      <TabsTrigger value="tea">Tea</TabsTrigger>
                      <TabsTrigger value="electronics">Electronics</TabsTrigger>
                      <TabsTrigger value="textiles">Textiles</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MarketPriceChart data={marketData} />
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Market Insights</CardTitle>
                            <CardDescription>Current market analysis and predictions</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="border-l-4 border-primary p-4 bg-primary-50">
                                <h3 className="font-medium text-lg">Coffee Prices Rising</h3>
                                <p className="text-neutral-600 mt-2">
                                  Coffee prices have increased by 8% in the last month due to supply concerns in Brazil. 
                                  Consider expediting current shipments to take advantage of this trend.
                                </p>
                              </div>
                              
                              <div className="border-l-4 border-secondary p-4 bg-secondary-50">
                                <h3 className="font-medium text-lg">Electronics Import Opportunity</h3>
                                <p className="text-neutral-600 mt-2">
                                  Recent trade agreements with Asian countries have reduced import duties on 
                                  consumer electronics by 12%. This creates a significant margin opportunity.
                                </p>
                              </div>
                              
                              <div className="border-l-4 border-accent p-4 bg-accent-50">
                                <h3 className="font-medium text-lg">Tea Export Demand</h3>
                                <p className="text-neutral-600 mt-2">
                                  UK market shows increased demand for specialty teas with competitive tariffs 
                                  for Commonwealth nations. Consider increasing production capacity.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Price Comparison Table */}
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>Product Price Comparison</CardTitle>
                          <CardDescription>Compare prices across markets</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr className="bg-neutral-50 text-neutral-600 text-left text-sm">
                                  <th className="py-2 px-3 font-medium">Product</th>
                                  <th className="py-2 px-3 font-medium">Current Price</th>
                                  <th className="py-2 px-3 font-medium">30-Day High</th>
                                  <th className="py-2 px-3 font-medium">30-Day Low</th>
                                  <th className="py-2 px-3 font-medium">Change</th>
                                  <th className="py-2 px-3 font-medium">Forecast</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100">
                                {marketData?.slice(0, 5).map((item) => (
                                  <tr key={item._id} className="text-sm text-neutral-800 hover:bg-neutral-50">
                                    <td className="py-3 px-3 font-medium">{item.productName}</td>
                                    <td className="py-3 px-3">${item.currentPrice.toFixed(2)}</td>
                                    <td className="py-3 px-3">${(item.currentPrice * 1.1).toFixed(2)}</td>
                                    <td className="py-3 px-3">${(item.currentPrice * 0.9).toFixed(2)}</td>
                                    <td className={`py-3 px-3 ${item.priceChange > 0 ? 'text-success' : 'text-error'}`}>
                                      {item.priceChange > 0 ? '+' : ''}{item.priceChange}%
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className="material-icons text-accent">
                                        {item.priceChange > 0 ? 'trending_up' : 'trending_down'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Other tabs content would be similar */}
                    <TabsContent value="coffee">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-medium">Coffee Market Details</h3>
                          <p>Detailed coffee market data would be displayed here.</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
      
      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Product to Monitor</DialogTitle>
            <DialogDescription>
              Add a new product to track market prices and trends.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleProductSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productName" className="text-right">
                  Product Name
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  value={productFormData.productName}
                  onChange={handleProductInputChange}
                  className="col-span-3"
                  placeholder="e.g., Robusta Coffee"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  name="category"
                  value={productFormData.category}
                  onValueChange={(value) => handleProductSelectChange('category', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="tea">Tea</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                    <SelectItem value="minerals">Minerals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPrice" className="text-right">
                  Current Price
                </Label>
                <Input
                  id="currentPrice"
                  name="currentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productFormData.currentPrice}
                  onChange={handleProductInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priceChange" className="text-right">
                  Price Change (%)
                </Label>
                <Input
                  id="priceChange"
                  name="priceChange"
                  type="number"
                  value={productFormData.priceChange}
                  onChange={handleProductInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">
                  Currency
                </Label>
                <Select
                  name="currency"
                  value={productFormData.currency}
                  onValueChange={(value) => handleProductSelectChange('currency', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="RWF">RWF</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="marketPlace" className="text-right">
                  Market Place
                </Label>
                <Input
                  id="marketPlace"
                  name="marketPlace"
                  value={productFormData.marketPlace}
                  onChange={handleProductInputChange}
                  className="col-span-3"
                  placeholder="e.g., Global, Europe, East Africa"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProductMutation.isPending}>
                {addProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* New Analysis Dialog */}
      <Dialog open={isNewAnalysisDialogOpen} onOpenChange={setIsNewAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Market Analysis</DialogTitle>
            <DialogDescription>
              Add a new market insight or opportunity analysis.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAnalysisSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={analysisFormData.title}
                  onChange={handleAnalysisInputChange}
                  className="col-span-3"
                  placeholder="e.g., Coffee Export Opportunity"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={analysisFormData.description}
                  onChange={handleAnalysisInputChange}
                  className="col-span-3"
                  placeholder="Detailed market analysis..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productCategory" className="text-right">
                  Product Category
                </Label>
                <Select
                  name="productCategory"
                  value={analysisFormData.productCategory}
                  onValueChange={(value) => handleAnalysisSelectChange('productCategory', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="tea">Tea</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                    <SelectItem value="minerals">Minerals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="marketTrend" className="text-right">
                  Market Trend
                </Label>
                <Select
                  name="marketTrend"
                  value={analysisFormData.marketTrend}
                  onValueChange={(value) => handleAnalysisSelectChange('marketTrend', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select trend" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rising">Rising</SelectItem>
                    <SelectItem value="falling">Falling</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="volatile">Volatile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="insightType" className="text-right">
                  Insight Type
                </Label>
                <Select
                  name="insightType"
                  value={analysisFormData.insightType}
                  onValueChange={(value) => handleAnalysisSelectChange('insightType', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="insight">Market Insight</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewAnalysisDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addAnalysisMutation.isPending}>
                {addAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Analysis'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
