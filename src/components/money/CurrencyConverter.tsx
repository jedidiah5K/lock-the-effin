import React, { useState, useEffect } from 'react';
import { FaTimes, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import { currencies, convertCurrencyOffline, mockExchangeRates } from '../../utils/currencyUtils';
import { useMoneyStore } from '../../store/moneyStore';

interface CurrencyConverterProps {
  onClose: () => void;
}

interface ConversionHistory {
  id: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  date: Date;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onClose }) => {
  const { defaultCurrency } = useMoneyStore();
  
  const [fromAmount, setFromAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>(defaultCurrency);
  const [toAmount, setToAmount] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>(() => {
    const savedHistory = localStorage.getItem('conversionHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  // Convert when component mounts or when currencies change
  useEffect(() => {
    handleConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency]);
  
  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory.slice(0, 10)));
  }, [conversionHistory]);
  
  const handleConvert = async () => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setIsConverting(true);
      setError('');
      
      const amount = parseFloat(fromAmount);
      
      // In a real app, we would call an API here
      // For now, we'll use our offline conversion utility
      const convertedAmount = convertCurrencyOffline(amount, fromCurrency, toCurrency);
      
      setToAmount(convertedAmount.toFixed(2));
      
      // Add to history
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        fromAmount: amount,
        fromCurrency,
        toAmount: convertedAmount,
        toCurrency,
        date: new Date()
      };
      
      setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };
  
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };
  
  const applyHistoryItem = (item: ConversionHistory) => {
    setFromAmount(item.fromAmount.toString());
    setFromCurrency(item.fromCurrency);
    setToAmount(item.toAmount.toString());
    setToCurrency(item.toCurrency);
  };
  
  const clearHistory = () => {
    setConversionHistory([]);
    localStorage.removeItem('conversionHistory');
  };
  
  // Get currency info
  const fromCurrencyInfo = currencies.find(c => c.code === fromCurrency) || currencies[0];
  const toCurrencyInfo = currencies.find(c => c.code === toCurrency) || currencies[0];
  
  // Get exchange rate
  let exchangeRate = 1;
  if (fromCurrency === 'USD') {
    exchangeRate = mockExchangeRates.USD[toCurrency] || 1;
  } else if (toCurrency === 'USD') {
    exchangeRate = 1 / (mockExchangeRates.USD[fromCurrency] || 1);
  } else if (mockExchangeRates.USD[fromCurrency] && mockExchangeRates.USD[toCurrency]) {
    // Convert through USD
    exchangeRate = mockExchangeRates.USD[toCurrency] / mockExchangeRates.USD[fromCurrency];
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Currency Converter
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              From
            </label>
            <div className="flex">
              <input
                type="number"
                step="0.01"
                min="0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="input flex-1"
                placeholder="Amount"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="input ml-2 w-24"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {fromCurrencyInfo.name} ({fromCurrencyInfo.symbol})
            </p>
          </div>
          
          <div className="flex justify-center my-4">
            <button
              onClick={swapCurrencies}
              className="p-2 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            >
              <FaExchangeAlt />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              To
            </label>
            <div className="flex">
              <input
                type="text"
                value={toAmount}
                readOnly
                className="input flex-1 bg-slate-50 dark:bg-slate-700"
                placeholder="Converted amount"
              />
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="input ml-2 w-24"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {toCurrencyInfo.name} ({toCurrencyInfo.symbol})
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg mb-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
          </div>
          
          <button
            onClick={handleConvert}
            className={`btn-primary w-full ${isConverting ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isConverting}
          >
            {isConverting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Convert
          </button>
          
          {/* Conversion History */}
          {conversionHistory.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                  <FaHistory className="mr-1" />
                  Recent Conversions
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {conversionHistory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => applyHistoryItem(item)}
                    className="w-full text-left p-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex justify-between">
                      <span>
                        {item.fromAmount.toFixed(2)} {item.fromCurrency}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">→</span>
                      <span>
                        {item.toAmount.toFixed(2)} {item.toCurrency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(item.date).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
