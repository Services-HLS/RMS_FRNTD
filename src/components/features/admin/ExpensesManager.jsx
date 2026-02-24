import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Loader } from '../../ui';
import api from '../../../services/api';

const ExpensesManager = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const data = await api.getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newExpense.category || !newExpense.amount || !newExpense.expense_date) {
            alert("Please fill all mandatory fields (Category, Amount, Date)");
            return;
        }
        setSaving(true);
        try {
            const added = await api.addExpense({
                ...newExpense,
                amount: parseFloat(newExpense.amount),
            });
            setExpenses([...expenses, added]);
            setNewExpense({ category: '', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
        } catch (error) {
            console.error("Failed to add expense", error);
            alert("Failed to save expense. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const totalStats = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Expenses Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-red-50 border-red-100">
                    <h3 className="text-gray-500 font-medium">Total Expenses</h3>
                    <p className="text-3xl font-bold text-red-600">₹{totalStats.toFixed(2)}</p>
                </Card>
            </div>

            <Card title="Add New Expense">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Date *</label>
                        <Input
                            type="date"
                            value={newExpense.expense_date}
                            onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                        <Input
                            placeholder="e.g. Rent, Groceries"
                            value={newExpense.category}
                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Amount *</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <Input
                            placeholder="Optional"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <Button onClick={handleAdd} className="w-full md:w-auto" disabled={saving}>
                            {saving ? 'Saving...' : 'Add Expense'}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No expenses recorded yet.</td>
                            </tr>
                        )}
                        {expenses.map(expense => (
                            <tr key={expense.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.expense_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">₹{parseFloat(expense.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpensesManager;
