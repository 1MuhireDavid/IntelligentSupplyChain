import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyExchangeRate } from '@shared/schema';
import { useState } from 'react';

interface CurrencyExchangeProps {
  rates?: CurrencyExchangeRate[];
}

// Currency symbols mapping
const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'CNY': '¥',
  'KES': 'K',
  'RWF': 'RWF'
};

// Default rates if none are provided
const defaultRates = [
  { id: 1, baseCurrency: 'RWF', targetCurrency: 'USD', rate: 0.00077, change: 0.4, lastUpdated: new Date().toISOString() },
  { id: 2, baseCurrency: 'RWF', targetCurrency: 'EUR', rate: 0.00070, change: 0.2, lastUpdated: new Date().toISOString() },
  { id: 3, baseCurrency: 'RWF', targetCurrency: 'GBP', rate: 0.00060, change: -0.3, lastUpdated: new Date().toISOString() },
  { id: 4, baseCurrency: 'RWF', targetCurrency: 'CNY', rate: 0.0054, change: -0.5, lastUpdated: new Date().toISOString() },
  { id: 5, baseCurrency: 'RWF', targetCurrency: 'KES', rate: 0.105, change: 0.1, lastUpdated: new Date().toISOString() }
];

export default function CurrencyExchange({ rates }: CurrencyExchangeProps) {
  const [baseCurrency, setBaseCurrency] = useState('RWF');
  
  // Use the provided rates or fall back to default ones
  const displayRates = rates && rates.length > 0 ? rates : defaultRates;
  
  // Calculate time since last update
  const getUpdateTime = (dateString: string) => {
    const lastUpdated = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / (24 * 60))}d ago`;
    }
  };

  return (
    <Card className="border-neutral-100">
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Currency Exchange</CardTitle>
        <span className="text-xs text-neutral-500">
          Updated {displayRates[0] ? getUpdateTime(displayRates[0].lastUpdated) : '10m ago'}
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full">
            <select 
              className="w-full appearance-none bg-white border border-neutral-200 px-4 py-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
            >
              <option>Rwanda Franc (RWF)</option>
              <option>US Dollar (USD)</option>
              <option>Euro (EUR)</option>
              <option>British Pound (GBP)</option>
            </select>
            <span className="material-icons absolute right-2 top-2 text-neutral-500 pointer-events-none">arrow_drop_down</span>
          </div>
        </div>
        <div className="space-y-3">
          {displayRates.map((rate) => (
            <div key={rate.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-50">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-medium text-neutral-800">
                  {currencySymbols[rate.targetCurrency as keyof typeof currencySymbols] || rate.targetCurrency.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-neutral-800">{rate.targetCurrency}</p>
                  <p className="text-xs text-neutral-500">
                    {rate.targetCurrency === 'USD' ? 'US Dollar' : 
                     rate.targetCurrency === 'EUR' ? 'Euro' :
                     rate.targetCurrency === 'GBP' ? 'British Pound' :
                     rate.targetCurrency === 'CNY' ? 'Chinese Yuan' :
                     rate.targetCurrency === 'KES' ? 'Kenyan Shilling' :
                     rate.targetCurrency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-neutral-800">
                  {Math.round(rate.rate * 1000)} {rate.baseCurrency}
                </p>
                <p className={`text-xs ${rate.change >= 0 ? 'text-success' : 'text-error'} flex items-center justify-end`}>
                  <span className="material-icons text-xs mr-1">
                    {rate.change >= 0 ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  {Math.abs(rate.change)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
