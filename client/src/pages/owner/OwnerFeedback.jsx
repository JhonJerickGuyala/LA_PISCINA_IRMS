import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OwnerFeedback = ({ feedbackData, feedbackStats, dateRange, setDateRange, feedbackFilter, setFeedbackFilter }) => {
  const feedbackChartData = [
    { name: 'Positive', value: feedbackStats.positive, color: '#2A9D8F' },
    { name: 'Neutral', value: feedbackStats.neutral, color: '#F7B801' },
    { name: 'Negative', value: feedbackStats.negative, color: '#E76F51' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-lp-dark mb-2">
              Filter by Type
            </label>
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lp-orange focus:border-lp-orange"
            >
              <option value="all">All Feedback</option>
              <option value="positive">Positive (4-5 stars)</option>
              <option value="neutral">Neutral (3 stars)</option>
              <option value="negative">Negative (1-2 stars)</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-lp-dark mb-2">
              Date Range
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lp-orange focus:border-lp-orange"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-lp-dark mb-4">Feedback Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feedbackChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#FF6B35" name="Count">
                {feedbackChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-lp-dark mb-4">Feedback Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-lp-dark">Positive</span>
              <span className="text-2xl font-bold text-green-600">{feedbackStats.positive}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-lp-dark">Neutral</span>
              <span className="text-2xl font-bold text-yellow-600">{feedbackStats.neutral}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-lp-dark">Negative</span>
              <span className="text-2xl font-bold text-red-600">{feedbackStats.negative}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-lp-dark">Total Feedback</span>
                <span className="text-2xl font-bold text-lp-orange">{feedbackData.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-lp-light-bg">
          <h3 className="text-lg font-semibold text-lp-dark">Customer Feedback</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {feedbackData.map((feedback, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-lp-dark">{feedback.customerName}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < feedback.rating ? 'text-lp-orange' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(feedback.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerFeedback;