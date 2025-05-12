import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';

// Define type for currency exchange rate
interface CurrencyExchangeRate {
  id: number;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  change: number;
  lastUpdated: string;
}

// Define props interface
interface CurrencyExchangeProps {
  rates?: CurrencyExchangeRate[];
}

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'CNY': '¥',
  'KES': 'K',
  'RWF': 'RWF',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'INR': '₹'
};

// Default rates relative to USD
const defaultBaseRates: Record<string, number> = {
  'USD': 1,
  'EUR': 0.91,
  'GBP': 0.78,
  'CNY': 7.05,
  'KES': 136.25,
  'RWF': 1298.75,
  'JPY': 151.62,
  'CAD': 1.36,
  'AUD': 1.52,
  'INR': 83.90
};

// Full currency names
const currencyNames: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'CNY': 'Chinese Yuan',
  'KES': 'Kenyan Shilling',
  'RWF': 'Rwanda Franc',
  'JPY': 'Japanese Yen',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'INR': 'Indian Rupee'
};

export default function CurrencyExchange({ rates }: CurrencyExchangeProps): JSX.Element {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [amount, setAmount] = useState<number>(1);
  const [baseRates, setBaseRates] = useState<Record<string, number>>(defaultBaseRates);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [displayCurrencies, setDisplayCurrencies] = useState<string[]>(['EUR', 'GBP', 'CNY', 'KES', 'RWF']);

  // Generate random change values between -1.5 and 1.5
  const generateRandomChanges = (): Record<string, number> => {
    const changes: Record<string, number> = {};
    Object.keys(baseRates).forEach(currency => {
      changes[currency] = parseFloat((Math.random() * 3 - 1.5).toFixed(1));
    });
    return changes;
  };

  const [changes, setChanges] = useState<Record<string, number>>(generateRandomChanges());

  // Calculate conversions from base currency
  const calculateConversion = (targetCurrency: string): number => {
    const baseRate = baseRates[baseCurrency];
    const targetRate = baseRates[targetCurrency];
    return baseRate ? (targetRate / baseRate) * amount : 0;
  };

  // Update rates to simulate real-time changes
  useEffect(() => {
    // Mock periodic rate updates
    const interval = setInterval(() => {
      const newRates = { ...baseRates };
      const newChanges = { ...changes };
      
      // Update a random set of currencies
      Object.keys(newRates).forEach(currency => {
        if (Math.random() > 0.7) {
          const fluctuation = 1 + (Math.random() * 0.01 - 0.005);
          newRates[currency] *= fluctuation;
          
          // Update change percentage
          const newChange = parseFloat((changes[currency] + (Math.random() * 0.4 - 0.2)).toFixed(1));
          newChanges[currency] = Math.max(-2.0, Math.min(2.0, newChange));
        }
      });
      
      setBaseRates(newRates);
      setChanges(newChanges);
      setLastUpdated(new Date().toISOString());
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(interval);
  }, [baseRates, changes]);

  // Calculate time since last update
  const getUpdateTime = (dateString: string): string => {
    const lastUpdated = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return `just now`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / (24 * 60))}d ago`;
    }
  };

  // Add or remove a currency from display
  const toggleCurrency = (currency: string): void => {
    if (displayCurrencies.includes(currency)) {
      setDisplayCurrencies(displayCurrencies.filter(c => c !== currency));
    } else {
      setDisplayCurrencies([...displayCurrencies, currency]);
    }
  };

  return (
    <Card className="border-neutral-100">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Currency Exchange</CardTitle>
        <span className="text-xs text-neutral-500">
          Updated {getUpdateTime(lastUpdated)}
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 space-y-3">
          {/* Base Currency Selection */}
          <div>
            <label className="block text-sm mb-1 text-neutral-600">Base Currency</label>
            <div className="relative w-full">
              <select 
                className="w-full appearance-none bg-white border border-neutral-200 px-4 py-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
              >
                {Object.keys(baseRates).map(currency => (
                  <option key={currency} value={currency}>
                    {currencyNames[currency]} ({currency})
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-2 text-neutral-500 pointer-events-none">▼</span>
            </div>
          </div>
          
          {/* Amount Input */}
          <div>
            <label className="block text-sm mb-1 text-neutral-600">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-neutral-500">
                {currencySymbols[baseCurrency] || baseCurrency}
              </span>
              <input
                type="number"
                className="w-full pl-8 pr-4 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          {/* Display Currency Selection */}
          <div>
            <label className="block text-sm mb-1 text-neutral-600">Display Currencies</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(baseRates)
                .filter(currency => currency !== baseCurrency)
                .map(currency => (
                  <button
                    key={currency}
                    onClick={() => toggleCurrency(currency)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      displayCurrencies.includes(currency)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
            </div>
          </div>
        </div>
        
        {/* Currency Rates Display */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium text-neutral-500 mb-2">Exchange Rates</div>
          {Object.keys(baseRates)
            .filter(currency => currency !== baseCurrency && displayCurrencies.includes(currency))
            .map(currency => {
              const conversion = calculateConversion(currency);
              return (
                <div key={currency} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-medium text-neutral-800">
                      {currencySymbols[currency] || currency.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-neutral-800">{currency}</p>
                      <p className="text-xs text-neutral-500">{currencyNames[currency]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-800">
                      {currencySymbols[currency] || ''}{conversion.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end">
                      <p className={`text-xs ${changes[currency] >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                        <span className="mr-1">
                          {changes[currency] >= 0 ? '↑' : '↓'}
                        </span>
                        {Math.abs(changes[currency])}%
                      </p>
                      <p className="text-xs text-neutral-500 ml-2">
                        1 {baseCurrency} = {(baseRates[currency] / baseRates[baseCurrency]).toFixed(4)} {currency}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}