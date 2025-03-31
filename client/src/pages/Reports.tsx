import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFinancialData } from '@/lib/db';
import { Transaction, Budget } from '@shared/schema';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line
} from 'recharts';

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [timeFrame, setTimeFrame] = useState('month');
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    // Set document title
    document.title = 'Reports - FinTrack';
    
    const loadData = async () => {
      const { transactions, budgets } = await getFinancialData();
      setTransactions(transactions);
      setBudgets(budgets);
      
      // Process data for reports
      processExpensesByCategory(transactions, timeFrame);
      processIncomeVsExpense(transactions, timeFrame);
      processTrendData(transactions);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    // Reprocess data when timeframe changes
    processExpensesByCategory(transactions, timeFrame);
    processIncomeVsExpense(transactions, timeFrame);
  }, [timeFrame, transactions]);

  const processExpensesByCategory = (transactions: Transaction[], timeFrame: string) => {
    // Filter transactions by timeframe
    const filteredTransactions = filterTransactionsByTimeFrame(transactions, timeFrame);
    
    // Get expenses only
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    // Group by category and sum amounts
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });
    
    // Convert to array for the chart
    const data = Array.from(categoryMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
    
    setExpensesByCategory(data);
  };

  const processIncomeVsExpense = (transactions: Transaction[], timeFrame: string) => {
    // Filter transactions by timeframe
    const filteredTransactions = filterTransactionsByTimeFrame(transactions, timeFrame);
    
    // Calculate total income and expense
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setIncomeVsExpense([
      { name: 'Income', value: Number(income.toFixed(2)) },
      { name: 'Expenses', value: Number(expense.toFixed(2)) }
    ]);
  };

  const processTrendData = (transactions: Transaction[]) => {
    // Group transactions by month
    const monthlyData = new Map<string, { income: number, expense: number }>();
    
    // Get past 6 months
    const today = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      return {
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth()
      };
    }).reverse();
    
    // Initialize monthly data
    months.forEach(m => {
      monthlyData.set(`${m.name} ${m.year}`, { income: 0, expense: 0 });
    });
    
    // Sum transactions by month
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;
      
      // Skip if not in our tracked months
      if (!monthlyData.has(key)) return;
      
      const data = monthlyData.get(key)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
      monthlyData.set(key, data);
    });
    
    // Convert to array for chart
    const data = Array.from(monthlyData).map(([name, values]) => ({
      name,
      Income: Number(values.income.toFixed(2)),
      Expenses: Number(values.expense.toFixed(2))
    }));
    
    setTrendData(data);
  };

  const filterTransactionsByTimeFrame = (transactions: Transaction[], timeFrame: string) => {
    const today = new Date();
    let startDate: Date;
    
    switch (timeFrame) {
      case 'week':
        // Last 7 days
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        // Current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        // Last 3 months
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        // Current year
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  // Colors for charts
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-borderGray">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center text-sm">
              <span className="w-3 h-3 inline-block mr-2" style={{ backgroundColor: entry.color }}></span>
              <span>{entry.name}: {formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Financial Reports</h1>
        <div className="w-full sm:w-40">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger>
              <SelectValue placeholder="Time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4 w-full flex justify-start">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="expenses" className="flex-1 sm:flex-none">Expenses</TabsTrigger>
          <TabsTrigger value="trends" className="flex-1 sm:flex-none">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income vs. Expenses */}
            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-4">Income vs. Expenses</h2>
              {incomeVsExpense.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeVsExpense}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Amount">
                        {incomeVsExpense.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === 'Income' ? '#10b981' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-textGray">No data available</p>
                </div>
              )}
            </Card>
            
            {/* Expenses by Category */}
            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
              {expensesByCategory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-textGray">No expense data available</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card className="p-5">
            <h2 className="text-lg font-semibold mb-4">Detailed Expenses</h2>
            {expensesByCategory.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expensesByCategory}
                    layout="vertical"
                    margin={{ top: 20, right: 20, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="value" fill="#2563eb" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-textGray">No expense data available</p>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="p-5">
            <h2 className="text-lg font-semibold mb-4">Income & Expense Trends</h2>
            {trendData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Income" stroke="#10b981" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="Expenses" stroke="#ef4444" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-textGray">No trend data available</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
