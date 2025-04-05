import React, { useState } from 'react';
import { FaTimes, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { useMoneyStore } from '../../store/moneyStore';
import { currencies } from '../../utils/currencyUtils';

interface BudgetFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editBudget?: any; // For editing existing budgets
}

// Common budget categories (same as expense categories)
const budgetCategories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Personal Care',
  'Home',
  'Gifts & Donations',
  'Investments',
  'Business',
  'Other'
];

const BudgetForm: React.FC<BudgetFormProps> = ({ 
  onClose, 
  onSuccess,
  editBudget 
}) => {
  const { createBudget, updateBudget, defaultCurrency } = useMoneyStore();
  
  const [name, setName] = useState(editBudget?.name || '');
  const [amount, setAmount] = useState(editBudget?.amount?.toString() || '');
  const [category, setCategory] = useState(editBudget?.category || '');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    editBudget?.period || 'monthly'
  );
  const [startDate, setStartDate] = useState(() => {
    if (editBudget?.startDate) {
      return new Date(editBudget.startDate).toISOString().split('T')[0];
    }
    // Default to first day of current month
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    if (editBudget?.endDate) {
      return new Date(editBudget.endDate).toISOString().split('T')[0];
    }
    // Default to last day of current month
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState(editBudget?.currency || defaultCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !category) {
      setError('Name, amount, and category are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const budgetData = {
        name,
        amount: parseFloat(amount),
        category,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currency,
        spent: editBudget?.spent || 0
      };
      
      if (editBudget) {
        await updateBudget(editBudget.id, budgetData);
      } else {
        await createBudget(budgetData);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
      setIsSubmitting(false);
    }
  };
  
  // Set date range based on period selection
  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setPeriod(newPeriod);
    
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    
    if (newPeriod === 'daily') {
      // Today only
      setStartDate(now.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (newPeriod === 'weekly') {
      // Current week (Sunday to Saturday)
      start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      end.setDate(start.getDate() + 6); // End of week (Saturday)
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (newPeriod === 'monthly') {
      // Current month
      start.setDate(1); // First day of month
      end.setMonth(now.getMonth() + 1, 0); // Last day of month
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (newPeriod === 'yearly') {
      // Current year
      start = new Date(now.getFullYear(), 0, 1); // January 1st
      end = new Date(now.getFullYear(), 11, 31); // December 31st
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editBudget ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Budget Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="e.g., Monthly Groceries"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Budget Amount
            </label>
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMoneyBillWave className="text-slate-400" />
                </div>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input ml-2 w-24"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Select a category</option>
              {budgetCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Budget Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                className={`py-2 px-3 text-center text-sm rounded ${
                  period === 'daily'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => handlePeriodChange('daily')}
              >
                Daily
              </button>
              <button
                type="button"
                className={`py-2 px-3 text-center text-sm rounded ${
                  period === 'weekly'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => handlePeriodChange('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`py-2 px-3 text-center text-sm rounded ${
                  period === 'monthly'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => handlePeriodChange('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`py-2 px-3 text-center text-sm rounded ${
                  period === 'yearly'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => handlePeriodChange('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-slate-400" />
                  </div>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input pl-10 w-full"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="endDate" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-slate-400" />
                  </div>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input pl-10 w-full"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              {editBudget ? 'Update' : 'Create'} Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
