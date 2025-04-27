import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import CustomsStatusCard from "@/components/dashboard/customs-status-card";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CustomsManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({
    shipmentId: '',
    title: '',
    description: '',
    destination: '',
    status: 'pending',
    progress: 0,
    requiredDocuments: [
      "Commercial Invoice",
      "Packing List",
      "Bill of Lading",
      "Certificate of Origin",
      "Import License",
      "Customs Declaration Form"
    ]
  });
  
  const { toast } = useToast();
  
  const { data: customsDocuments, isLoading } = useQuery({
    queryKey: ["/api/customs-documents"],
  });
  
  const addDocumentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/customs-documents', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customs-documents'] });
      toast({
        title: "Success",
        description: "Customs document created successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create customs document",
        variant: "destructive",
      });
    }
  });
  
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/customs-documents/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customs-documents'] });
      toast({
        title: "Success",
        description: "Customs document updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update customs document",
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setFormData({
      shipmentId: '',
      title: '',
      description: '',
      destination: '',
      status: 'pending',
      progress: 0,
      requiredDocuments: [
        "Commercial Invoice",
        "Packing List",
        "Bill of Lading",
        "Certificate of Origin",
        "Import License",
        "Customs Declaration Form"
      ]
    });
    setSelectedDocument(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-update progress based on status
    if (name === 'status') {
      let progress = 0;
      if (value === 'in progress') progress = 50;
      if (value === 'cleared') progress = 100;
      setFormData(prev => ({ ...prev, progress }));
    }
  };
  
  const handleAddSubmit = (e) => {
    e.preventDefault();
    addDocumentMutation.mutate(formData);
  };
  
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedDocument) return;
    
    updateDocumentMutation.mutate({
      id: selectedDocument._id,
      data: formData
    });
  };
  
  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setFormData({
      shipmentId: doc.shipmentId,
      title: doc.title,
      description: doc.description || '',
      destination: doc.destination,
      status: doc.status,
      progress: doc.progress,
      requiredDocuments: doc.requiredDocuments || [
        "Commercial Invoice",
        "Packing List",
        "Bill of Lading",
        "Certificate of Origin",
        "Import License",
        "Customs Declaration Form"
      ]
    });
    setIsEditDialogOpen(true);
  };
  
  const handleViewDetails = (doc) => {
    setSelectedDocument(doc);
    setIsViewDetailsDialogOpen(true);
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
                  <h1 className="text-2xl font-bold text-neutral-800">Customs Management</h1>
                  <p className="mt-1 text-neutral-600">Streamline your customs documentation and compliance</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  >
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
                          <div key={doc._id} className="border-l-4 border-primary p-4 bg-primary-50">
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
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(doc)}>View Details</Button>
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
                                <tr key={doc._id} className="text-sm text-neutral-800 hover:bg-neutral-50">
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
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleViewDetails(doc)}
                                      >
                                        View
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEdit(doc)}
                                      >
                                        Edit
                                      </Button>
                                    </div>
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
      
      {/* Add Customs Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customs Document</DialogTitle>
            <DialogDescription>
              Create a new customs document for your shipment.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shipmentId" className="text-right">
                  Shipment ID
                </Label>
                <Input
                  id="shipmentId"
                  name="shipmentId"
                  value={formData.shipmentId}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
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
                  required
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Document</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Customs Document Details</DialogTitle>
            <DialogDescription>
              View detailed information about this customs document.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <>
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{selectedDocument.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedDocument.status === 'cleared' ? 'bg-green-100 text-green-800' :
                    selectedDocument.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-neutral-200 text-neutral-600'
                  }`}>
                    {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid gap-4">
                  <div className="text-sm">
                    <strong>Shipment ID:</strong> {selectedDocument.shipmentId}
                  </div>
                  
                  <div className="text-sm">
                    <strong>Destination:</strong> {selectedDocument.destination}
                  </div>
                  
                  {selectedDocument.description && (
                    <div className="text-sm mt-2">
                      <strong>Description:</strong><br />
                      {selectedDocument.description}
                    </div>
                  )}
                  
                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Required Documents for Customs Clearance</h4>
                    <div className="border rounded-md p-3 bg-neutral-50">
                      <ul className="space-y-2">
                        {selectedDocument.requiredDocuments ? (
                          selectedDocument.requiredDocuments.map((doc, index) => (
                            <li key={index} className="flex items-center">
                              <span className="inline-block w-4 h-4 bg-primary-100 text-primary-800 rounded-full mr-2 flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              {doc}
                            </li>
                          ))
                        ) : (
                          <li className="text-neutral-500">Standard customs documentation required.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Clearance Progress</h4>
                    <div className="space-y-2">
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div 
                          className={`rounded-full h-2.5 ${
                            selectedDocument.status === 'cleared' ? 'bg-green-500' :
                            selectedDocument.status === 'in progress' ? 'bg-yellow-500' :
                            'bg-neutral-400'
                          }`} 
                          style={{ width: `${selectedDocument.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Document Preparation</span>
                        <span>Submission</span>
                        <span>Processing</span>
                        <span>Cleared</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Customs Office Contact</h4>
                    <div className="text-sm">
                      <p>Rwanda Revenue Authority - Customs Department</p>
                      <p>KN 4 Ave, Kigali</p>
                      <p>Tel: +250 252 595 500</p>
                      <p>Email: customs@rra.gov.rw</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                {selectedDocument.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    className="mr-auto"
                    onClick={() => {
                      updateDocumentMutation.mutate({
                        id: selectedDocument._id,
                        data: {
                          ...formData,
                          status: 'in progress',
                          progress: 50
                        }
                      });
                      setIsViewDetailsDialogOpen(false);
                    }}
                  >
                    Start Processing
                  </Button>
                )}
                <Button onClick={() => setIsViewDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Customs Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customs Document</DialogTitle>
            <DialogDescription>
              Update the customs document details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-shipmentId" className="text-right">
                  Shipment ID
                </Label>
                <Input
                  id="edit-shipmentId"
                  name="shipmentId"
                  value={formData.shipmentId}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-destination" className="text-right">
                  Destination
                </Label>
                <Input
                  id="edit-destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Document</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
