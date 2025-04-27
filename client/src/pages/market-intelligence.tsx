import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import MarketPriceChart from "@/components/dashboard/market-price-chart";

export default function MarketIntelligence() {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market-data"],
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
                  <h1 className="text-2xl font-bold text-neutral-800">Market Intelligence</h1>
                  <p className="mt-1 text-neutral-600">Monitor global markets and identify trading opportunities</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <span className="mr-1">+</span> Add Product to Monitor
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
                                  <tr key={item.id} className="text-sm text-neutral-800 hover:bg-neutral-50">
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
    </div>
  );
}
