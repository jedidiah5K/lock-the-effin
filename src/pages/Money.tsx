import React, { useEffect, useState } from 'react';
import { 
  FaPlus, 
  FaChartPie, 
  FaExchangeAlt, 
  FaFilter, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisH
} from 'react-icons/fa';
import { useMoneyStore } from '../store/moneyStore';
import { formatCurrency, currencies } from '../utils/currencyUtils';
import TransactionForm from '../components/money/TransactionForm';
import BudgetForm from '../components/money/BudgetForm';
import CurrencyConverter from '../components/money/CurrencyConverter';
import SpendingChart from '../components/money/SpendingChart';

const Money: React.FC = () => {
  const { 
    transactions, 
    budgets, 
    fetchTransactions, 
    fetchBudgets, 
    getBalance,
    getSpendingByCategory,
    defaultCurrency,
    setDefaultCurrency,
    loading, 
    error 
  } = useMoneyStore();
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets' | 'analytics'>('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0); // Last day of current month
    return date;
  });
  
  useEffect(() => {
    fetchTransactions(startDate, endDate);
    fetchBudgets();
  }, [fetchTransactions, fetchBudgets, startDate, endDate]);
  
  // Update date range when selection changes
  useEffect(() => {
    const now = new Date();
    
    if (dateRange === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(start);
      setEndDate(end);
    } else if (dateRange === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // End of week (Saturday)
      setStartDate(start);
      setEndDate(end);
    } else if (dateRange === 'all') {
      setStartDate(new Date(0)); // Beginning of time
      setEndDate(new Date()); // Now
    }
  }, [dateRange]);
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(
    transaction => transaction.date >= startDate && transaction.date <= endDate
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate totals
  const balance = getBalance();
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get spending by category for charts
  const spendingByCategory = getSpendingByCategory(startDate, endDate);
  
  // Active budgets (current period)
  const activeBudgets = budgets.filter(
    budget => budget.startDate <= new Date() && budget.endDate >= new Date()
  );
  
  return (
    <div className="money-page p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Money Manager</h1>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowCurrencyConverter(true)}
            className="btn-outline py-2 px-3 flex items-center"
          >
            <FaExchangeAlt className="mr-2" />
            <span>Convert</span>
          </button>
          
          <div className="relative">
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="input py-2 pl-3 pr-8 appearance-none"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 8l4 4 4-4"
                />
              </svg>
            </div>
          </div>
          
          <button 
            onClick={() => activeTab === 'transactions' ? setShowTransactionForm(true) : setShowBudgetForm(true)}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <FaPlus className="mr-2" />
            <span>{activeTab === 'transactions' ? 'Add Transaction' : activeTab === 'budgets' ? 'Add Budget' : 'Add'}</span>
          </button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Current Balance</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(balance, defaultCurrency)}
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Income</h3>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(income, defaultCurrency)}
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(expenses, defaultCurrency)}
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'transactions'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'budgets'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('budgets')}
        >
          Budgets
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'analytics'
              ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      {/* Date Filter */}
      <div className="flex items-center mb-6 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
        <div className="mr-2">
          <FaCalendarAlt className="text-slate-500" />
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="bg-transparent border-none text-sm font-medium focus:outline-none"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
          <option value="custom">Custom Range</option>
        </select>
        
        {dateRange === 'custom' && (
          <div className="flex ml-4 space-x-2">
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="input py-1 px-2 text-sm"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="input py-1 px-2 text-sm"
            />
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="transactions-tab">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                    <FaMoneyBillWave className="text-3xl text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No transactions found</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Add your first transaction to start tracking your finances
                  </p>
                  <button 
                    onClick={() => setShowTransactionForm(true)}
                    className="btn-primary py-2 px-4 inline-flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    <span>Add Transaction</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Category</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(transaction => (
                        <tr 
                          key={transaction.id} 
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <td className="py-3 px-4 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {transaction.description || transaction.category}
                            </div>
                            {transaction.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {transaction.tags.map(tag => (
                                  <span 
                                    key={tag} 
                                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">{transaction.category}</td>
                          <td className={`py-3 px-4 text-right font-medium ${
                            transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            <div className="flex items-center justify-end">
                              {transaction.type === 'income' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                            {transaction.originalAmount && (
                              <div className="text-xs text-slate-500">
                                Originally: {formatCurrency(transaction.originalAmount, transaction.originalCurrency || '')}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                              <FaEllipsisH />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Budgets Tab */}
          {activeTab === 'budgets' && (
            <div className="budgets-tab">
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                    <FaMoneyBillWave className="text-3xl text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No budgets found</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Create your first budget to start managing your spending
                  </p>
                  <button 
                    onClick={() => setShowBudgetForm(true)}
                    className="btn-primary py-2 px-4 inline-flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    <span>Create Budget</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBudgets.map(budget => {
                    const percentage = Math.min(100, Math.round((budget.spent / budget.amount) * 100));
                    const isOverBudget = budget.spent > budget.amount;
                    
                    return (
                      <div key={budget.id} className="card p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">{budget.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{budget.category}</p>
                          </div>
                          <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                            <FaEllipsisH />
                          </button>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-1">
                          <span>Spent: {formatCurrency(budget.spent, budget.currency)}</span>
                          <span>Budget: {formatCurrency(budget.amount, budget.currency)}</span>
                        </div>
                        
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              isOverBudget ? 'bg-red-600' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        
                        <p className={`text-sm font-medium ${
                          isOverBudget ? 'text-red-600' : percentage > 80 ? 'text-amber-500' : 'text-emerald-600'
                        }`}>
                          {isOverBudget ? 'Over budget' : `${percentage}% used`}
                        </p>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                  
                  <div className="card p-4 border-dashed border-2 flex flex-col items-center justify-center text-center">
                    <button 
                      onClick={() => setShowBudgetForm(true)}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <FaPlus className="text-xl mb-2" />
                      <span className="font-medium">Add New Budget</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-4">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">Spending by Category</h3>
                  <div className="h-64">
                    <SpendingChart data={spendingByCategory} />
                  </div>
                </div>
                
                <div className="card p-4">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">Income vs Expenses</h3>
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="flex items-center justify-center w-full">
                      <div className="text-center px-4">
                        <div className="text-3xl font-bold text-emerald-600">{formatCurrency(income, defaultCurrency)}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Income</div>
                      </div>
                      <div className="text-center px-4">
                        <div className="text-3xl font-bold text-red-600">{formatCurrency(expenses, defaultCurrency)}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Expenses</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 w-full max-w-xs">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Savings Rate</span>
                        <span>{income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-indigo-600"
                          style={{ width: `${income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm 
          onClose={() => setShowTransactionForm(false)} 
          onSuccess={() => {
            setShowTransactionForm(false);
            fetchTransactions(startDate, endDate);
          }}
        />
      )}
      
      {/* Budget Form Modal */}
      {showBudgetForm && (
        <BudgetForm 
          onClose={() => setShowBudgetForm(false)} 
          onSuccess={() => {
            setShowBudgetForm(false);
            fetchBudgets();
          }}
        />
      )}
      
      {/* Currency Converter Modal */}
      {showCurrencyConverter && (
        <CurrencyConverter onClose={() => setShowCurrencyConverter(false)} />
      )}
    </div>
  );
};

export default Money;
