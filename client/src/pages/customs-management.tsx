import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CustomsStatusCard from "@/components/dashboard/customs-status-card";

export default function CustomsManagement() {
  const { data: customsDocuments, isLoading } = useQuery({
    queryKey: ["/api/customs-documents"],
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
                  <h1 className="text-2xl font-bold text-neutral-800">Customs Management</h1>
                  <p className="mt-1 text-neutral-600">Streamline your customs documentation and compliance</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <span className="mr-1">+</span> New Customs Document
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customs Status Overview</CardTitle>
                      <CardDescription>Summary of your documents status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Cleared</span>
                            <span className="font-medium">
                              {customsDocuments?.filter(doc => doc.status === 'cleared').length || 0}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-2">
                            <div className="bg-success rounded-full h-2" style={{ 
                              width: customsDocuments?.length ? 
                                `${(customsDocuments.filter(doc => doc.status === 'cleared').length / customsDocuments.length) * 100}%` 
                                : '0%' 
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>In Progress</span>
                            <span className="font-medium">
                              {customsDocuments?.filter(doc => doc.status === 'in progress').length || 0}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-2">
                            <div className="bg-warning rounded-full h-2" style={{ 
                              width: customsDocuments?.length ? 
                                `${(customsDocuments.filter(doc => doc.status === 'in progress').length / customsDocuments.length) * 100}%` 
                                : '0%' 
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-medium">
                              {customsDocuments?.filter(doc => doc.status === 'pending').length || 0}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-2">
                            <div className="bg-neutral-400 rounded-full h-2" style={{ 
                              width: customsDocuments?.length ? 
                                `${(customsDocuments.filter(doc => doc.status === 'pending').length / customsDocuments.length) * 100}%` 
                                : '0%' 
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Customs Activities</CardTitle>
                      <CardDescription>Latest updates on your customs processing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {customsDocuments?.slice(0, 3).map((doc) => (
                          <div key={doc.id} className="border-l-4 border-primary p-4 bg-primary-50">
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-neutral-600 mt-1">
                              Destination: {doc.destination}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                doc.status === 'cleared' ? 'bg-success bg-opacity-10 text-success' :
                                doc.status === 'in progress' ? 'bg-warning bg-opacity-10 text-warning' :
                                'bg-neutral-200 text-neutral-600'
                              }`}>
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </span>
                              <Button variant="ghost" size="sm">View Details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <CardTitle>Customs Documents</CardTitle>
                        <CardDescription>Manage your customs documentation</CardDescription>
                      </div>
                      <Button variant="outline" className="mt-2 md:mt-0">Generate Report</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all">
                      <TabsList className="mb-4">
                        <TabsTrigger value="all">All Documents</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                        <TabsTrigger value="cleared">Cleared</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="all">
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead>
                              <tr className="bg-neutral-50 text-neutral-600 text-left text-sm">
                                <th className="py-2 px-3 font-medium">Shipment ID</th>
                                <th className="py-2 px-3 font-medium">Title</th>
                                <th className="py-2 px-3 font-medium">Destination</th>
                                <th className="py-2 px-3 font-medium">Status</th>
                                <th className="py-2 px-3 font-medium">Progress</th>
                                <th className="py-2 px-3 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {customsDocuments?.map((doc) => (
                                <tr key={doc.id} className="text-sm text-neutral-800 hover:bg-neutral-50">
                                  <td className="py-3 px-3 font-medium">{doc.shipmentId}</td>
                                  <td className="py-3 px-3">{doc.title}</td>
                                  <td className="py-3 px-3">{doc.destination}</td>
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      doc.status === 'cleared' ? 'bg-success bg-opacity-10 text-success' :
                                      doc.status === 'in progress' ? 'bg-warning bg-opacity-10 text-warning' :
                                      'bg-neutral-200 text-neutral-600'
                                    }`}>
                                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="w-full bg-neutral-100 rounded-full h-2">
                                      <div 
                                        className={`rounded-full h-2 ${
                                          doc.status === 'cleared' ? 'bg-success' :
                                          doc.status === 'in progress' ? 'bg-warning' :
                                          'bg-neutral-400'
                                        }`} 
                                        style={{ width: `${doc.progress}%` }}
                                      ></div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>
                      
                      {/* Other tab contents would be filtered versions of the above table */}
                    </Tabs>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Updates</CardTitle>
                    <CardDescription>Stay informed about customs regulation changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border p-4 rounded-lg">
                        <div className="flex justify-between">
                          <h3 className="font-medium">EU Import Documentation Requirements</h3>
                          <span className="text-xs text-neutral-500">Effective: June 1, 2023</span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-2">
                          The European Union has updated import documentation requirements for agricultural products.
                          All shipments must now include detailed pesticide usage records.
                        </p>
                        <Button className="mt-3" variant="outline" size="sm">Review Changes</Button>
                      </div>
                      
                      <div className="border p-4 rounded-lg">
                        <div className="flex justify-between">
                          <h3 className="font-medium">East African Community Tariff Changes</h3>
                          <span className="text-xs text-neutral-500">Effective: July 15, 2023</span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-2">
                          The EAC has announced reductions in import duties for medical supplies and equipment
                          to support healthcare development in the region.
                        </p>
                        <Button className="mt-3" variant="outline" size="sm">Review Changes</Button>
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
