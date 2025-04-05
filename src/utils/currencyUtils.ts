// Common currency codes
export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' }
];

// Get currency info by code
export const getCurrencyByCode = (code: string) => {
  return currencies.find(currency => currency.code === code) || currencies[0];
};

// Format amount with currency symbol
export const formatCurrency = (amount: number, currencyCode: string) => {
  const currency = getCurrencyByCode(currencyCode);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Exchange rates API
export const fetchExchangeRates = async (baseCurrency: string = 'USD') => {
  try {
    // In a real app, you would use an actual API like Open Exchange Rates, ExchangeRate-API, etc.
    // For demo purposes, we'll use a mock implementation
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
};

// Convert amount from one currency to another
export const convertCurrency = async (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
) => {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    const rates = await fetchExchangeRates(fromCurrency);
    if (!rates) throw new Error('Failed to fetch exchange rates');
    
    const rate = rates[toCurrency];
    if (!rate) throw new Error(`Exchange rate not found for ${toCurrency}`);
    
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount; // Return original amount on error
  }
};

// Mock exchange rates for offline use
export const mockExchangeRates: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.91,
    GBP: 0.78,
    JPY: 151.16,
    CNY: 7.23,
    INR: 83.50,
    CAD: 1.37,
    AUD: 1.51,
    PHP: 57.13,
    SGD: 1.35,
    MYR: 4.73,
    THB: 36.31,
    KRW: 1369.86,
    IDR: 16187.50,
    RUB: 92.26,
    BRL: 5.07,
    ZAR: 18.73,
    MXN: 16.82,
    AED: 3.67,
    SAR: 3.75
  }
};

// Offline currency conversion
export const convertCurrencyOffline = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Direct conversion if we have the rate
  if (mockExchangeRates[fromCurrency] && mockExchangeRates[fromCurrency][toCurrency]) {
    return amount * mockExchangeRates[fromCurrency][toCurrency];
  }
  
  // Convert through USD if direct rate not available
  if (fromCurrency !== 'USD' && mockExchangeRates['USD'][fromCurrency]) {
    const amountInUSD = amount / mockExchangeRates['USD'][fromCurrency];
    if (toCurrency === 'USD') return amountInUSD;
    
    if (mockExchangeRates['USD'][toCurrency]) {
      return amountInUSD * mockExchangeRates['USD'][toCurrency];
    }
  }
  
  // Fallback
  return amount;
};
