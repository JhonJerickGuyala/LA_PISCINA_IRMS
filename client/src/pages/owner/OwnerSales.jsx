import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend 
} from 'recharts';

const OwnerSales = () => {
  // --- STATE: DASHBOARD (Graphs & Stats) ---
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [filterType, setFilterType] = useState('monthly'); 
  
  const [data, setData] = useState({
    chartData: [],
    serviceData: [], 
    recentSales: [], // Limit 10 (Overview)
    stats: { today: 0, thisMonth: 0, thisYear: 0 }
  });

  // --- STATE: FULL HISTORY (Bottom Section) ---
  const [historyTransactions, setHistoryTransactions] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'All',
    paymentMethod: 'All'
  });

  // --- CONSTANTS ---
  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  const months = [
    { val: 1, name: 'January' }, { val: 2, name: 'February' }, { val: 3, name: 'March' },
    { val: 4, name: 'April' }, { val: 5, name: 'May' }, { val: 6, name: 'June' },
    { val: 7, name: 'July' }, { val: 8, name: 'August' }, { val: 9, name: 'September' },
    { val: 10, name: 'October' }, { val: 11, name: 'November' }, { val: 12, name: 'December' }
  ];

  const getPeriodLabel = () => {
    if (filterType === 'daily') {
        const m = months.find(m => m.val == selectedMonth)?.name;
        return `${m} ${selectedYear}`;
    }
    return `${selectedYear}`;
  };

  // --- EFFECT 1: Load Years ---
  useEffect(() => {
    axios.get('http://localhost:5000/api/owner/sales/years')
      .then(res => {
        setYears(res.data);
        if(res.data.length === 0) setYears([new Date().getFullYear()]);
      })
      .catch(err => console.error(err));
  }, []);

  // --- EFFECT 2: Load Dashboard Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/owner/sales', {
          params: { year: selectedYear, month: selectedMonth, filterType: filterType }
        });
        
        const formattedChartData = res.data.chartData.map(item => ({
            ...item, total: parseFloat(item.total)
        }));
        
        const formattedServiceData = res.data.serviceData.map(item => ({
            name: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : 'Others', 
            value: parseFloat(item.value)
        }));

        setData({ ...res.data, chartData: formattedChartData, serviceData: formattedServiceData });
      } catch (err) {
        console.error("Error getting dashboard data", err);
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth, filterType]);

  // --- EFFECT 3: Load History Data (Bottom Section) ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Siguraduhin na na-add mo na ang '/history' route sa backend code mo
        const res = await axios.get('http://localhost:5000/api/owner/sales/history', {
          params: historyFilters
        });
        setHistoryTransactions(res.data);
      } catch (err) {
        console.error("Error fetching history", err);
      }
    };
    fetchHistory();
  }, [historyFilters]);

  // --- HANDLERS ---
  const handleHistoryFilterChange = (e) => {
    setHistoryFilters({ ...historyFilters, [e.target.name]: e.target.value });
  };

  const resetHistoryFilters = () => {
    setHistoryFilters({
      startDate: '',
      endDate: '',
      category: 'All',
      paymentMethod: 'All'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* ================= DASHBOARD HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Overview</h1>
        <span className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</span>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Sales Today</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₱{parseFloat(data.stats.today || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase">This Month</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₱{parseFloat(data.stats.thisMonth || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Total Year</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₱{parseFloat(data.stats.thisYear || 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* ================= DASHBOARD CONTROLS ================= */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-orange-500 font-medium"
          >
            {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
            {years.length === 0 && <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
          </select>

          {filterType === 'daily' && (
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-orange-500 font-medium"
            >
              {months.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filterType === type ? 'bg-white text-orange-600 shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ================= GRAPHS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 capitalize">
            Revenue Trend <span className="text-orange-500">({getPeriodLabel()})</span>
          </h2>
          <div className="h-[350px] w-full">
            {data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val)=>`₱${val}`}/>
                  <RechartsTooltip cursor={{fill: '#F3F4F6'}} formatter={(val)=>[ `₱${Number(val).toLocaleString()}`, 'Revenue']}/>
                  <Bar dataKey="total" radius={[4,4,0,0]} barSize={40}>
                     {data.chartData.map((_, i) => <Cell key={i} fill="#F97316" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No revenue data available</div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Sales by Service Type <span className="text-blue-500">({getPeriodLabel()})</span>
            </h2>
            <div className="h-[350px] w-full">
                {data.serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.serviceData}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: "20px"}} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No service data available</div>
                )}
            </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-10"></div>

      {/* ================= HISTORY SECTION (FULL TABLE WITH FILTERS) ================= */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction History</h2>
        <p className="text-gray-500 text-sm">Filter and view all past transactions.</p>
      </div>

      {/* HISTORY FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end border border-gray-100">
        {/* Date Range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Start Date</label>
          <input 
            type="date" 
            name="startDate"
            value={historyFilters.startDate} 
            onChange={handleHistoryFilterChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-orange-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">End Date</label>
          <input 
            type="date" 
            name="endDate"
            value={historyFilters.endDate} 
            onChange={handleHistoryFilterChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-orange-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Category</label>
          <select 
            name="category" 
            value={historyFilters.category} 
            onChange={handleHistoryFilterChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-orange-500 min-w-[150px]"
          >
            <option value="All">All Categories</option>
            <option value="kubo">Kubo</option>
            <option value="cabin">Cabin</option>
            <option value="table">Table</option>
            <option value="pool">Pool</option>
            <option value="room">Room</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Payment</label>
          <select 
            name="paymentMethod" 
            value={historyFilters.paymentMethod} 
            onChange={handleHistoryFilterChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-orange-500 min-w-[150px]"
          >
            <option value="All">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Reset Button */}
        <button 
          onClick={resetHistoryFilters}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors ml-auto"
        >
          Reset Filters
        </button>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white p-6 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Detailed Records</h3>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {historyTransactions.length} Records Found
            </span>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-xs font-bold text-gray-500 uppercase border-b">
                <th className="py-4 pl-6">Date & Time</th>
                <th className="py-4">Service Name</th>
                <th className="py-4">Category</th>
                <th className="py-4">Payment</th>
                <th className="py-4 text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyTransactions.length > 0 ? (
                historyTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pl-6 text-sm text-gray-700">
                      {new Date(t.date).toLocaleDateString()} <br/>
                      <span className="text-gray-400 text-xs">{new Date(t.date).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-800">{t.serviceName || 'N/A'}</td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize
                        ${t.serviceType === 'kubo' ? 'bg-green-100 text-green-700' : ''}
                        ${t.serviceType === 'cabin' ? 'bg-blue-100 text-blue-700' : ''}
                        ${t.serviceType === 'table' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${t.serviceType === 'pool' ? 'bg-cyan-100 text-cyan-700' : ''}
                        ${!['kubo','cabin','table','pool'].includes(t.serviceType) ? 'bg-gray-100 text-gray-600' : ''}
                      `}>
                        {t.serviceType || '-'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                        <span className="border border-gray-200 px-2 py-1 rounded bg-gray-50 text-xs">
                            {t.paymentMethod}
                        </span>
                    </td>
                    <td className="py-3 pr-6 text-sm font-semibold text-right text-gray-800">
                      ₱{parseFloat(t.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OwnerSales;