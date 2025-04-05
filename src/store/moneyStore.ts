import { create } from 'zustand';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from './authStore';
import { v4 as uuidv4 } from 'uuid';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date: Date;
  tags: string[];
  eventId?: string;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  currency: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MoneyState {
  transactions: Transaction[];
  budgets: Budget[];
  selectedTransaction: Transaction | null;
  selectedBudget: Budget | null;
  defaultCurrency: string;
  loading: boolean;
  error: string | null;
  
  fetchTransactions: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchTransaction: (id: string) => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<string>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  fetchBudgets: () => Promise<void>;
  fetchBudget: (id: string) => Promise<void>;
  createBudget: (data: Partial<Budget>) => Promise<string>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  getBalance: (currency?: string) => number;
  getSpendingByCategory: (startDate?: Date, endDate?: Date, currency?: string) => Record<string, number>;
  getIncomeByCategory: (startDate?: Date, endDate?: Date, currency?: string) => Record<string, number>;
  
  setDefaultCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number>;
  
  clearError: () => void;
}

export const useMoneyStore = create<MoneyState>((set, get) => ({
  transactions: [],
  budgets: [],
  selectedTransaction: null,
  selectedBudget: null,
  defaultCurrency: 'USD',
  loading: false,
  error: null,
  
  fetchTransactions: async (startDate, endDate) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      let transactionsQuery = query(
        collection(db, 'transactions'),
        where('createdBy', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      const transactions: Transaction[] = [];
      
      transactionsSnapshot.forEach(doc => {
        const transactionData = doc.data();
        transactions.push({
          ...transactionData,
          id: doc.id,
          date: transactionData.date.toDate(),
          createdAt: transactionData.createdAt.toDate(),
          updatedAt: transactionData.updatedAt.toDate()
        } as Transaction);
      });
      
      // Filter transactions by date range if provided
      const filteredTransactions = (startDate && endDate) 
        ? transactions.filter(transaction => 
            transaction.date >= startDate && transaction.date <= endDate)
        : transactions;
      
      set({ transactions: filteredTransactions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTransaction: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const transactionDoc = await getDoc(doc(db, 'transactions', id));
      
      if (transactionDoc.exists()) {
        const transactionData = transactionDoc.data();
        set({ 
          selectedTransaction: {
            ...transactionData,
            id: transactionDoc.id,
            date: transactionData.date.toDate(),
            createdAt: transactionData.createdAt.toDate(),
            updatedAt: transactionData.updatedAt.toDate()
          } as Transaction,
          loading: false 
        });
      } else {
        set({ error: 'Transaction not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createTransaction: async (data: Partial<Transaction>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const transactionId = data.id || uuidv4();
      const now = new Date();
      const { defaultCurrency } = get();
      
      // Handle currency conversion if needed
      let originalAmount = undefined;
      let originalCurrency = undefined;
      
      if (data.currency && data.currency !== defaultCurrency && data.amount) {
        originalAmount = data.amount;
        originalCurrency = data.currency;
      }
      
      const newTransaction: Transaction = {
        id: transactionId,
        amount: data.amount || 0,
        type: data.type || 'expense',
        category: data.category || 'Uncategorized',
        description: data.description,
        date: data.date || now,
        tags: data.tags || [],
        eventId: data.eventId,
        currency: data.currency || defaultCurrency,
        originalAmount,
        originalCurrency,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(doc(db, 'transactions', transactionId), {
        ...newTransaction,
        date: newTransaction.date,
        createdAt: now,
        updatedAt: now
      });
      
      // Update local state
      const { transactions } = get();
      set({ 
        transactions: [newTransaction, ...transactions],
        selectedTransaction: newTransaction,
        loading: false 
      });
      
      // Update budgets if this is an expense
      if (newTransaction.type === 'expense') {
        const { budgets } = get();
        const relevantBudgets = budgets.filter(budget => 
          budget.category === newTransaction.category &&
          newTransaction.date >= budget.startDate &&
          newTransaction.date <= budget.endDate
        );
        
        for (const budget of relevantBudgets) {
          // Convert transaction amount to budget currency if needed
          let amountInBudgetCurrency = newTransaction.amount;
          
          if (newTransaction.currency !== budget.currency) {
            try {
              amountInBudgetCurrency = await get().convertAmount(
                newTransaction.amount,
                newTransaction.currency,
                budget.currency
              );
            } catch (error) {
              console.error('Currency conversion error:', error);
            }
          }
          
          const updatedSpent = budget.spent + amountInBudgetCurrency;
          await get().updateBudget(budget.id, { spent: updatedSpent });
        }
      }
      
      return transactionId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    try {
      set({ loading: true, error: null });
      
      const transactionRef = doc(db, 'transactions', id);
      const now = new Date();
      
      // Get the original transaction first to handle budget updates
      const originalTransactionDoc = await getDoc(transactionRef);
      const originalTransaction = originalTransactionDoc.exists() 
        ? {
            ...originalTransactionDoc.data(),
            id: originalTransactionDoc.id,
            date: originalTransactionDoc.data().date.toDate(),
            createdAt: originalTransactionDoc.data().createdAt.toDate(),
            updatedAt: originalTransactionDoc.data().updatedAt.toDate()
          } as Transaction
        : null;
      
      await updateDoc(transactionRef, {
        ...data,
        date: data.date,
        updatedAt: now
      });
      
      // Update local state
      const { transactions, selectedTransaction } = get();
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === id ? { ...transaction, ...data, updatedAt: now } : transaction
      );
      
      set({ 
        transactions: updatedTransactions,
        selectedTransaction: selectedTransaction?.id === id 
          ? { ...selectedTransaction, ...data, updatedAt: now } 
          : selectedTransaction,
        loading: false 
      });
      
      // Update budgets if necessary
      if (originalTransaction && 
          (originalTransaction.type !== data.type || 
           originalTransaction.category !== data.category ||
           originalTransaction.amount !== data.amount ||
           originalTransaction.date !== data.date)) {
        
        // Remove from original budget if it was an expense
        if (originalTransaction.type === 'expense') {
          const { budgets } = get();
          const relevantBudgets = budgets.filter(budget => 
            budget.category === originalTransaction.category &&
            originalTransaction.date >= budget.startDate &&
            originalTransaction.date <= budget.endDate
          );
          
          for (const budget of relevantBudgets) {
            const updatedSpent = Math.max(0, budget.spent - originalTransaction.amount);
            await get().updateBudget(budget.id, { spent: updatedSpent });
          }
        }
        
        // Add to new budget if it's an expense
        const updatedTransaction = { ...originalTransaction, ...data };
        if (updatedTransaction.type === 'expense') {
          const { budgets } = get();
          const relevantBudgets = budgets.filter(budget => 
            budget.category === updatedTransaction.category &&
            updatedTransaction.date >= budget.startDate &&
            updatedTransaction.date <= budget.endDate
          );
          
          for (const budget of relevantBudgets) {
            const updatedSpent = budget.spent + updatedTransaction.amount;
            await get().updateBudget(budget.id, { spent: updatedSpent });
          }
        }
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteTransaction: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      // Get the transaction first to handle budget updates
      const transactionDoc = await getDoc(doc(db, 'transactions', id));
      const transaction = transactionDoc.exists() 
        ? {
            ...transactionDoc.data(),
            id: transactionDoc.id,
            date: transactionDoc.data().date.toDate(),
            createdAt: transactionDoc.data().createdAt.toDate(),
            updatedAt: transactionDoc.data().updatedAt.toDate()
          } as Transaction
        : null;
      
      await deleteDoc(doc(db, 'transactions', id));
      
      // Update local state
      const { transactions } = get();
      set({ 
        transactions: transactions.filter(t => t.id !== id),
        selectedTransaction: null,
        loading: false 
      });
      
      // Update budgets if this was an expense
      if (transaction && transaction.type === 'expense') {
        const { budgets } = get();
        const relevantBudgets = budgets.filter(budget => 
          budget.category === transaction.category &&
          transaction.date >= budget.startDate &&
          transaction.date <= budget.endDate
        );
        
        for (const budget of relevantBudgets) {
          const updatedSpent = Math.max(0, budget.spent - transaction.amount);
          await get().updateBudget(budget.id, { spent: updatedSpent });
        }
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchBudgets: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('createdBy', '==', user.uid),
        orderBy('startDate', 'desc')
      );
      
      const budgetsSnapshot = await getDocs(budgetsQuery);
      
      const budgets: Budget[] = [];
      
      budgetsSnapshot.forEach(doc => {
        const budgetData = doc.data();
        budgets.push({
          ...budgetData,
          id: doc.id,
          startDate: budgetData.startDate.toDate(),
          endDate: budgetData.endDate.toDate(),
          createdAt: budgetData.createdAt.toDate(),
          updatedAt: budgetData.updatedAt.toDate()
        } as Budget);
      });
      
      set({ budgets, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchBudget: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const budgetDoc = await getDoc(doc(db, 'budgets', id));
      
      if (budgetDoc.exists()) {
        const budgetData = budgetDoc.data();
        set({ 
          selectedBudget: {
            ...budgetData,
            id: budgetDoc.id,
            startDate: budgetData.startDate.toDate(),
            endDate: budgetData.endDate.toDate(),
            createdAt: budgetData.createdAt.toDate(),
            updatedAt: budgetData.updatedAt.toDate()
          } as Budget,
          loading: false 
        });
      } else {
        set({ error: 'Budget not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createBudget: async (data: Partial<Budget>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const budgetId = data.id || uuidv4();
      const now = new Date();
      const { defaultCurrency } = get();
      
      const newBudget: Budget = {
        id: budgetId,
        name: data.name || 'Untitled Budget',
        amount: data.amount || 0,
        spent: data.spent || 0,
        category: data.category || 'Uncategorized',
        period: data.period || 'monthly',
        startDate: data.startDate || now,
        endDate: data.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0), // End of current month
        currency: data.currency || defaultCurrency,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(doc(db, 'budgets', budgetId), {
        ...newBudget,
        startDate: newBudget.startDate,
        endDate: newBudget.endDate,
        createdAt: now,
        updatedAt: now
      });
      
      // Update local state
      const { budgets } = get();
      set({ 
        budgets: [...budgets, newBudget],
        selectedBudget: newBudget,
        loading: false 
      });
      
      return budgetId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateBudget: async (id: string, data: Partial<Budget>) => {
    try {
      set({ loading: true, error: null });
      
      const budgetRef = doc(db, 'budgets', id);
      const now = new Date();
      
      await updateDoc(budgetRef, {
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
        updatedAt: now
      });
      
      // Update local state
      const { budgets, selectedBudget } = get();
      const updatedBudgets = budgets.map(budget => 
        budget.id === id ? { ...budget, ...data, updatedAt: now } : budget
      );
      
      set({ 
        budgets: updatedBudgets,
        selectedBudget: selectedBudget?.id === id 
          ? { ...selectedBudget, ...data, updatedAt: now } 
          : selectedBudget,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteBudget: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'budgets', id));
      
      // Update local state
      const { budgets } = get();
      set({ 
        budgets: budgets.filter(budget => budget.id !== id),
        selectedBudget: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  getBalance: (currency?: string) => {
    const { transactions, defaultCurrency, convertAmount } = get();
    const targetCurrency = currency || defaultCurrency;
    
    // For simplicity in this implementation, we'll use a synchronous approach
    // In a real app with actual API calls, you'd need to handle this asynchronously
    
    return transactions.reduce((balance, transaction) => {
      let amount = transaction.amount;
      
      // If transaction is in a different currency, convert it
      // This is a simplified approach - in a real app you'd use actual conversion rates
      if (transaction.currency !== targetCurrency) {
        const conversionRate = 1; // Placeholder - would use actual rates in real app
        amount = amount * conversionRate;
      }
      
      return balance + (transaction.type === 'income' ? amount : -amount);
    }, 0);
  },
  
  getSpendingByCategory: (startDate, endDate, currency) => {
    const { transactions, defaultCurrency } = get();
    const targetCurrency = currency || defaultCurrency;
    
    // Filter transactions by date range and type
    const filteredTransactions = transactions.filter(transaction => 
      transaction.type === 'expense' && 
      (!startDate || transaction.date >= startDate) &&
      (!endDate || transaction.date <= endDate)
    );
    
    // Group by category and sum amounts
    return filteredTransactions.reduce((categories, transaction) => {
      const category = transaction.category;
      let amount = transaction.amount;
      
      // Simple currency conversion (would use actual rates in real app)
      if (transaction.currency !== targetCurrency) {
        const conversionRate = 1; // Placeholder
        amount = amount * conversionRate;
      }
      
      categories[category] = (categories[category] || 0) + amount;
      return categories;
    }, {} as Record<string, number>);
  },
  
  getIncomeByCategory: (startDate, endDate, currency) => {
    const { transactions, defaultCurrency } = get();
    const targetCurrency = currency || defaultCurrency;
    
    // Filter transactions by date range and type
    const filteredTransactions = transactions.filter(transaction => 
      transaction.type === 'income' && 
      (!startDate || transaction.date >= startDate) &&
      (!endDate || transaction.date <= endDate)
    );
    
    // Group by category and sum amounts
    return filteredTransactions.reduce((categories, transaction) => {
      const category = transaction.category;
      let amount = transaction.amount;
      
      // Simple currency conversion (would use actual rates in real app)
      if (transaction.currency !== targetCurrency) {
        const conversionRate = 1; // Placeholder
        amount = amount * conversionRate;
      }
      
      categories[category] = (categories[category] || 0) + amount;
      return categories;
    }, {} as Record<string, number>);
  },
  
  setDefaultCurrency: (currency: string) => {
    set({ defaultCurrency: currency });
    localStorage.setItem('defaultCurrency', currency);
  },
  
  convertAmount: async (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    try {
      // In a real app, you would use an actual API for conversion
      // For now, we'll use a simplified approach with mock rates
      const conversionRate = 1; // Placeholder - would fetch from API
      return amount * conversionRate;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount; // Return original amount on error
    }
  },
  
  clearError: () => set({ error: null }),
}));

// Initialize default currency from localStorage
if (typeof window !== 'undefined') {
  const savedCurrency = localStorage.getItem('defaultCurrency');
  if (savedCurrency) {
    useMoneyStore.getState().setDefaultCurrency(savedCurrency);
  }
}
