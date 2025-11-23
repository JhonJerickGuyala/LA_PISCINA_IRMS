import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';

const OwnerOverview = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalFeedback: 0,
    salesByService: [],
    feedbackDistribution: []
  });

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']; 
  const FEEDBACK_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TAMA NA ANG ENDPOINT: /api/owner/dashboard/stats
        const res = await axios.get('http://localhost:5000/api/owner/dashboard/stats');
        
        const formattedStats = {
            ...res.data,
            // Format Sales Data
            salesByService: res.data.salesByService.map(item => ({
                name: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : 'Others',
                value: parseFloat(item.value)
            })),
            // Format Feedback Data
            feedbackDistribution: res.data.feedbackDistribution.map(item => ({
                ...item,
                value: parseInt(item.value)
            }))
        };

        setStats(formattedStats);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center border-l-4 border-orange-500">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">
                ₱{parseFloat(stats.totalRevenue).toLocaleString()}
            </h2>
          </div>
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center border-l-4 border-blue-500">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">
                {stats.totalTransactions}
            </h2>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        {/* Customer Feedback */}
        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center border-l-4 border-green-500">
          <div>
            <p className="text-sm text-gray-500 font-medium">Customer Feedback</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">
                {stats.totalFeedback}
            </h2>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales by Service Type Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales by Service Type</h3>
            <div className="h-[300px]">
                {stats.salesByService.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.salesByService}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.salesByService.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(val) => `₱${val.toLocaleString()}`} />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No sales data yet</div>
                )}
            </div>
        </div>

        {/* Feedback Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Feedback Distribution</h3>
            <div className="h-[300px]">
                {stats.feedbackDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.feedbackDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                            >
                                {stats.feedbackDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                        entry.name === 'Positive' ? '#10B981' : 
                                        entry.name === 'Neutral' ? '#F59E0B' : '#EF4444'
                                    } />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No feedback data yet</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default OwnerOverview;