import React, { useState } from 'react';
import { FaTimes, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import { useMoneyStore } from '../../store/moneyStore';
import { currencies } from '../../utils/currencyUtils';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: any; // For editing existing transactions
}

// Common expense categories
const expenseCategories = [
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

// Common income categories
const incomeCategories = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Refunds',
  'Rental Income',
  'Other'
];

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onClose, 
  onSuccess,
  editTransaction 
}) => {
  const { createTransaction, updateTransaction, defaultCurrency } = useMoneyStore();
  
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [date, setDate] = useState(() => {
    if (editTransaction?.date) {
      return new Date(editTransaction.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState(editTransaction?.currency || defaultCurrency);
  const [tags, setTags] = useState<string[]>(editTransaction?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      setError('Amount and category are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const transactionData = {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        currency,
        tags
      };
      
      if (editTransaction) {
        await updateTransaction(editTransaction.id, transactionData);
      } else {
        await createTransaction(transactionData);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
      setIsSubmitting(false);
    }
  };
  
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transaction Type
            </label>
            <div className="flex rounded-md overflow-hidden border border-slate-300 dark:border-slate-600">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-center ${
                  type === 'expense'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-center ${
                  type === 'income'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full"
              placeholder="What was this for?"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="input flex-1"
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-outline ml-2"
              >
                <FaPlus />
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              {editTransaction ? 'Update' : 'Save'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
