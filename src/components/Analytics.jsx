import React, { useState, useContext, useMemo } from 'react';
import { POSContext } from '../context/POSContext';
import { TrendingUp, DollarSign, Package, TrendingDown, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

const safelyGetDateString = (dateValue) => {
  if (!dateValue) return null;
  if (Array.isArray(dateValue)) {
    const [year, month, day] = dateValue;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (typeof dateValue === 'string') return dateValue.split('T')[0].substring(0, 10);
  return null;
};

// ✅ Accept isDarkMode prop
const Analytics = ({ isDarkMode }) => {
  const { products, sales, fetchSales } = useContext(POSContext);
  const [dateFilter, setDateFilter] = useState({ selectedDate: '', startDate: '', endDate: '' });

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (!dateFilter.selectedDate && !(dateFilter.startDate && dateFilter.endDate)) return true; 
      const saleDateStr = safelyGetDateString(s.saleDate || s.date);
      if (!saleDateStr) return false;
      if (dateFilter.selectedDate) return saleDateStr === dateFilter.selectedDate;
      else if (dateFilter.startDate && dateFilter.endDate) return saleDateStr >= dateFilter.startDate && saleDateStr <= dateFilter.endDate;
      return true;
    });
  }, [sales, dateFilter]);

  const revenueKPI = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const profitKPI = filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  const trendData = useMemo(() => {
    const trend = {};
    filteredSales.forEach(s => {
      const dStr = safelyGetDateString(s.saleDate || s.date);
      if (!dStr) return;
      if (!trend[dStr]) trend[dStr] = { date: dStr, sales: 0, profit: 0 };
      trend[dStr].sales += (s.total || 0);
      trend[dStr].profit += (s.profit || 0);
    });
    return Object.values(trend).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  const categoryData = useMemo(() => {
    const catSales = {};
    filteredSales.forEach(s => {
      (s.items || []).forEach(item => {
        const product = products.find(p => p.id === (item.productId || item.product?.id));
        const cat = product ? product.category : (item.isCustom ? 'Custom' : 'Other');
        if (!catSales[cat]) catSales[cat] = 0;
        catSales[cat] += (item.unitPrice * item.quantity);
      });
    });
    return Object.keys(catSales).map(key => ({ category: key, revenue: catSales[key] }));
  }, [filteredSales, products]);

  const clearFilters = () => setDateFilter({ selectedDate: '', startDate: '', endDate: '' });

  // CSS variables for dark mode
  const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-800';
  const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBgClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';
  const subBgClass = isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';

  return (
    <div className="space-y-6">
      <div className={`${bgClass} rounded-xl shadow-lg p-6 flex flex-col xl:flex-row justify-between items-center gap-4`}>
        <h2 className={`text-2xl font-bold ${textClass}`}>Analytics Dashboard</h2>
        
        <div className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${subBgClass}`}>
          <div className="flex items-center gap-2">
            <label className={`text-xs font-bold uppercase ${mutedTextClass}`}>Specific Day:</label>
            <input type="date" value={dateFilter.selectedDate} onChange={e => setDateFilter({selectedDate: e.target.value, startDate: '', endDate: ''})} className={`border p-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          </div>
          
          <span className="font-bold text-gray-400 px-2">OR</span>
          
          <div className="flex items-center gap-2">
            <label className={`text-xs font-bold uppercase ${mutedTextClass}`}>Range:</label>
            <input type="date" value={dateFilter.startDate} onChange={e => setDateFilter({...dateFilter, startDate: e.target.value, selectedDate: ''})} className={`border p-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
            <span className={`text-sm ${mutedTextClass}`}>to</span>
            <input type="date" value={dateFilter.endDate} onChange={e => setDateFilter({...dateFilter, endDate: e.target.value, selectedDate: ''})} className={`border p-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          </div>

          <div className={`flex gap-2 border-l pl-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <button onClick={clearFilters} className={`${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-3 py-2 rounded-lg text-sm font-semibold`}>Clear</button>
            <button onClick={fetchSales} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><RefreshCw className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${bgClass} rounded-xl shadow-lg p-6 flex items-center justify-between border-l-4 border-green-500`}>
          <div><p className={`text-sm font-semibold uppercase ${mutedTextClass}`}>{dateFilter.selectedDate || dateFilter.startDate ? 'Filtered Revenue' : "Overall Revenue"}</p><p className="text-2xl font-bold text-green-500">${revenueKPI.toFixed(2)}</p></div>
          <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
        </div>
        <div className={`${bgClass} rounded-xl shadow-lg p-6 flex items-center justify-between border-l-4 border-blue-500`}>
          <div><p className={`text-sm font-semibold uppercase ${mutedTextClass}`}>{dateFilter.selectedDate || dateFilter.startDate ? 'Filtered Profit' : "Overall Profit"}</p><p className="text-2xl font-bold text-blue-500">${profitKPI.toFixed(2)}</p></div>
          <DollarSign className="w-10 h-10 text-blue-500 opacity-50" />
        </div>
        <div className={`${bgClass} rounded-xl shadow-lg p-6 flex items-center justify-between border-l-4 border-purple-500`}>
          <div><p className={`text-sm font-semibold uppercase ${mutedTextClass}`}>Total Products</p><p className="text-2xl font-bold text-purple-500">{products.length}</p></div>
          <Package className="w-10 h-10 text-purple-500 opacity-50" />
        </div>
        <div className={`${bgClass} rounded-xl shadow-lg p-6 flex items-center justify-between border-l-4 border-red-500`}>
          <div><p className={`text-sm font-semibold uppercase ${mutedTextClass}`}>Low Stock Alerts</p><p className="text-2xl font-bold text-red-500">{lowStockCount}</p></div>
          <TrendingDown className="w-10 h-10 text-red-500 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${bgClass} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Revenue & Profit Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', border: 'none', borderRadius: '8px' }} formatter={(value, name) => [`$${parseFloat(value).toFixed(2)}`, name === 'sales' ? 'Revenue' : 'Profit']} />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className={`h-[300px] flex items-center justify-center rounded-lg border border-dashed ${subBgClass} ${mutedTextClass}`}>No data available</div>
          )}
        </div>

        <div className={`${bgClass} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Sales by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" label={{ fill: isDarkMode ? '#fff' : '#000' }} outerRadius={100} dataKey="revenue">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', border: 'none', borderRadius: '8px' }} formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[300px] flex items-center justify-center rounded-lg border border-dashed ${subBgClass} ${mutedTextClass}`}>No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;