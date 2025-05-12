import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import MetricsCard from "@/components/dashboard/metrics-card";
import MarketPriceChart from "@/components/dashboard/market-price-chart";
import ShippingMap from "@/components/dashboard/shipping-map";
import SupplyChainTable from "@/components/dashboard/supply-chain-table";
import CustomsStatusCard from "@/components/dashboard/customs-status-card";
import CurrencyExchange from "@/components/dashboard/currency-exchange";
import MarketOpportunities from "@/components/dashboard/market-opportunities";
import RecentActivities from "@/components/dashboard/recent-activities";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NewAnalysisModal from "@/components/dashboard/new-analysis-modal";
import { useState } from "react";

export default function HomePage() {
  const { user } = useAuth();

  const [isModalOpen, setModalOpen] = useState(false);

  // Fetch shipping routes
  const { data: shippingRoutes, isLoading: loadingRoutes } = useQuery({
    queryKey: ["/api/shipping-routes"],
  });

  // Fetch customs documents
  const { data: customsDocuments, isLoading: loadingCustoms } = useQuery({
    queryKey: ["/api/customs-documents"],
  });

  // Fetch market data
  const { data: marketData, isLoading: loadingMarket } = useQuery({
    queryKey: ["/api/market-data"],
  });

  // Fetch recent activities
  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ["/api/activities/recent"],
  });

  // Fetch market opportunities
  const { data: opportunities, isLoading: loadingOpportunities } = useQuery({
    queryKey: ["/api/market-opportunities"],
  });

  // Fetch currency exchange rates
  const { data: exchangeRates, isLoading: loadingRates } = useQuery({
    queryKey: ["/api/currency-exchange-rates"],
  });

  const isLoading =
    loadingRoutes ||
    loadingCustoms ||
    loadingMarket ||
    loadingActivities ||
    loadingOpportunities ||
    loadingRates;

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
                  <h1 className="text-2xl font-bold text-neutral-800">
                    Dashboard Overview
                  </h1>
                  <p className="mt-1 text-neutral-600">
                    Real-time insights for your trade operations
                  </p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <div className="relative">
                    <select className="appearance-none bg-white border border-neutral-200 px-4 py-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last quarter</option>
                      <option>Last year</option>
                    </select>
                    <span className="material-icons absolute right-2 top-2 text-neutral-500 pointer-events-none">
                      arrow_drop_down
                    </span>
                  </div>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  >
                    <span className="mr-1">+</span> New Analysis
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
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <MetricsCard
                    title="Active Trade Routes"
                    value={shippingRoutes?.length || 0}
                    change={8}
                    isPositive={true}
                    icon="alt_route"
                    color="primary"
                  />
                  <MetricsCard
                    title="Pending Shipments"
                    value={
                      customsDocuments?.filter(
                        (doc) => doc.status === "pending"
                      ).length || 0
                    }
                    change={-3}
                    isPositive={false}
                    icon="local_shipping"
                    color="accent"
                  />
                  <MetricsCard
                    title="Average Delivery Time"
                    value={`${
                      calculateAvgDeliveryTime(shippingRoutes) || 4.2
                    } days`}
                    change={12}
                    isPositive={true}
                    icon="schedule"
                    color="info"
                  />
                  <MetricsCard
                    title="Cost Optimization"
                    value="22.5%"
                    change={5}
                    isPositive={true}
                    icon="savings"
                    color="secondary"
                  />
                </div>

                {/* Charts and Maps Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <MarketPriceChart data={marketData} />
                  {/* <ShippingMap routes={shippingRoutes} /> */}
                </div>

                {/* Supply Chain & Customs Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <SupplyChainTable routes={shippingRoutes} />
                  </div>
                  <CustomsStatusCard documents={customsDocuments} />
                </div>

                {/* Currency Exchange & Market Opportunities */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <CurrencyExchange rates={exchangeRates} />
                  <div className="lg:col-span-2">
                    <MarketOpportunities opportunities={opportunities} />
                  </div>
                </div>

                {/* Recent Activities Log */}
                <RecentActivities activities={activities} />
              </>
            )}
          </div>
          {isModalOpen && (
            <NewAnalysisModal onClose={() => setModalOpen(false)} />
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

// Helper function to calculate average delivery time
function calculateAvgDeliveryTime(routes) {
  if (!routes || routes.length === 0) return null;
  const sum = routes.reduce((acc, route) => acc + route.transitTime, 0);
  return (sum / routes.length).toFixed(1);
}
