import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import useStore from '../../store/useStore';
import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const TransactionsScreen = () => {
  const { user } = useStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/transactions?user_id=${user?.id || 'demo'}`);
        setTransactions(res.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 md:pb-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Download Report
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => {
                const isExpense = txn.type === 'expense';
                return (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(txn.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center mr-3',
                          isExpense ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        )}>
                          {isExpense ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        {txn.category || 'Uncategorized'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 capitalize">{txn.type}</td>
                    <td className={clsx('py-4 px-6 text-sm font-bold text-right', isExpense ? 'text-red-600' : 'text-green-600')}>
                      {isExpense ? '-' : '+'}₹{txn.amount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsScreen;
