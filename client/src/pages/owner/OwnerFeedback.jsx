import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie 
} from 'recharts';
import { Filter, Calendar, Star, MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const OwnerFeedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filterType, setFilterType] = useState('all');

  // Colors
  const COLORS = {
    positive: '#10B981', // Emerald 500
    neutral: '#F59E0B',  // Amber 500
    negative: '#EF4444'  // Red 500
  };

  useEffect(() => {
    fetchFeedback();
  }, [dateRange, filterType]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/owner/feedback', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          filter: filterType !== 'all' ? filterType : undefined
        }
      });
      setFeedbackData(res.data.feedback || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULATE STATS ---
  const stats = useMemo(() => {
    const total = feedbackData.length;
    if (total === 0) return { positive: 0, neutral: 0, negative: 0, total: 0, average: 0 };

    const positive = feedbackData.filter(f => f.rating >= 4).length;
    const neutral = feedbackData.filter(f => f.rating === 3).length;
    const negative = feedbackData.filter(f => f.rating <= 2).length;
    
    const sumRating = feedbackData.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sumRating / total).toFixed(1);

    return { positive, neutral, negative, total, average };
  }, [feedbackData]);

  const barChartData = [
    { name: 'Positive', count: stats.positive, fill: COLORS.positive },
    { name: 'Neutral', count: stats.neutral, fill: COLORS.neutral },
    { name: 'Negative', count: stats.negative, fill: COLORS.negative },
  ];

  const pieChartData = [
    { name: 'Positive', value: stats.positive },
    { name: 'Neutral', value: stats.neutral },
    { name: 'Negative', value: stats.negative },
  ];

  // Custom Tooltip para sa Graphs
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-500">Count: <span className="font-bold text-lp-orange">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Feedback Analytics</h2>
            <p className="text-gray-500 text-sm">Monitor customer satisfaction and reviews</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            {/* Type Filter */}
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-lp-orange outline-none text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                    <option value="all">All Ratings</option>
                    <option value="positive">Positive (4-5 ★)</option>
                    <option value="neutral">Neutral (3 ★)</option>
                    <option value="negative">Negative (1-2 ★)</option>
                </select>
            </div>

            {/* Date Inputs */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400"/>
                <input 
                    type="date" 
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="bg-transparent outline-none w-32"
                />
                <span className="text-gray-300">|</span>
                <input 
                    type="date" 
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="bg-transparent outline-none w-32"
                />
            </div>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Average Rating</span>
            <div className="flex items-center gap-2">
                <h3 className="text-4xl font-extrabold text-gray-800">{stats.average}</h3>
                <Star className="text-yellow-400 fill-yellow-400" size={28} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Based on {stats.total} reviews</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">Positive</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.positive}</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><ThumbsUp size={20}/></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">Neutral</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.neutral}</h3>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Minus size={20}/></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">Negative</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.negative}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-full"><ThumbsDown size={20}/></div>
        </div>
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart (Donut) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-700 mb-2 w-full text-left">Sentiment Distribution</h3>
            <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill={COLORS.positive} />
                            <Cell fill={COLORS.neutral} />
                            <Cell fill={COLORS.negative} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                    <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
                    <span className="text-xs text-gray-400 uppercase">Total</span>
                </div>
            </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Feedback Volume</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB"/>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fill: '#6B7280', fontSize: 13, fontWeight: 500}} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                            {barChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- RECENT REVIEWS LIST --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-700">Recent Reviews</h3>
            <div className="text-xs text-gray-400 italic">Showing latest feedback</div>
        </div>
        
        {loading ? (
            <div className="p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lp-orange mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading feedback...</p>
            </div>
        ) : feedbackData.length > 0 ? (
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {feedbackData.map((fb, index) => (
                    <div key={index} className="p-6 hover:bg-orange-50/30 transition-colors group">
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 ${
                                fb.rating >= 4 ? 'bg-green-400' : fb.rating === 3 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}>
                                {fb.customerName ? fb.customerName.charAt(0).toUpperCase() : 'G'}
                            </div>
                            
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-base">{fb.customerName || "Anonymous Guest"}</h4>
                                        <p className="text-xs text-gray-400 mb-2">{new Date(fb.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="flex bg-gray-100 px-2 py-1 rounded-md">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={14} 
                                                className={i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none mt-1 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <p className="text-gray-600 text-sm leading-relaxed italic">
                                        "{fb.comment}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="py-16 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <MessageSquare size={32} className="text-gray-300" />
                </div>
                <h3 className="text-gray-800 font-medium">No feedback found</h3>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default OwnerFeedback;