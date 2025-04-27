import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MarketData } from '@shared/schema';

interface MarketPriceChartProps {
  data?: MarketData[];
}

export default function MarketPriceChart({ data }: MarketPriceChartProps) {
  const [selectedProduct, setSelectedProduct] = useState('Coffee');
  
  // Generate sample price history data if real data isn't structured for a chart yet
  const generateChartData = () => {
    if (!data || data.length === 0) {
      return [];
    }

    // For demonstration purposes, create time series data from the market data
    // In a real app, this would come directly from the API in the right format
    const filteredData = data.filter(item => 
      item.productName.toLowerCase().includes(selectedProduct.toLowerCase())
    );

    if (filteredData.length === 0) {
      return [];
    }

    // Use the first matching product
    const product = filteredData[0];
    
    // If the product has historical data, use it
    if (product.historicalData) {
      return product.historicalData;
    }
    
    // Otherwise generate placeholder time series
    const currentPrice = product.currentPrice;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      // Create some variation based on the current price
      const deviation = Math.sin(index * 0.5) * 0.15;
      const price = currentPrice * (1 + deviation);
      
      return {
        name: month,
        price: parseFloat(price.toFixed(2)),
        // Mark the current month
        isCurrent: index === currentMonth
      };
    });
  };

  const chartData = generateChartData();
  
  // Calculate statistics from the chart data
  const calculateStats = () => {
    if (chartData.length === 0) {
      return {
        current: 0,
        high: 0,
        low: 0
      };
    }
    
    const prices = chartData.map(d => d.price);
    return {
      current: chartData.find(d => d.isCurrent)?.price || prices[prices.length - 1],
      high: Math.max(...prices),
      low: Math.min(...prices)
    };
  };
  
  const stats = calculateStats();

  return (
    <Card className="border-neutral-100">
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Market Price Trends</CardTitle>
        <div className="flex items-center space-x-2">
          <select 
            className="appearance-none bg-white border border-neutral-200 px-2 py-1 pr-6 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option>Coffee</option>
            <option>Tea</option>
            <option>Electronics</option>
            <option>Textiles</option>
          </select>
          <button className="text-neutral-400 hover:text-neutral-600">
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#1565C0"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-500">No price data available for {selectedProduct}</p>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-neutral-500 text-sm">Current Price</p>
            <p className="font-medium text-neutral-800">${stats.current.toFixed(2)}/kg</p>
          </div>
          <div className="text-center">
            <p className="text-neutral-500 text-sm">30-Day High</p>
            <p className="font-medium text-neutral-800">${stats.high.toFixed(2)}/kg</p>
          </div>
          <div className="text-center">
            <p className="text-neutral-500 text-sm">30-Day Low</p>
            <p className="font-medium text-neutral-800">${stats.low.toFixed(2)}/kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
