import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import OwnerOverview from './OwnerOverview';
import OwnerSales from './OwnerSales';
import OwnerFeedback from './OwnerFeedback';
import OwnerAmenities from './OwnerAmenities';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Sales data
  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesByService, setSalesByService] = useState([]);
  
  // Feedback data
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ positive: 0, negative: 0, neutral: 0 });
  
  // Amenities data
  const [amenities, setAmenities] = useState([]);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [chartType, setChartType] = useState('bar');
  const [feedbackFilter, setFeedbackFilter] = useState('all');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.role === 'owner') {
      setUser(userData);
      fetchDashboardData();
    } else {
      window.location.href = '/';
    }
  }, [dateRange, feedbackFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSalesData(),
        fetchFeedbackData(),
        fetchAmenities()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/owner/sales", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      const sales = response.data.sales || [];
      setSalesData(sales);

      const total = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
      setTotalRevenue(total);

      const grouped = sales.reduce((a, s) => {
        a[s.serviceType] = (a[s.serviceType] || 0) + Number(s.amount || 0);
        return a;
      }, {});

      setSalesByService(
        Object.keys(grouped).map(key => ({
          name: key,
          value: grouped[key]
        }))
      );
    } catch (error) {
      console.error("Error loading sales:", error);
      setSalesData([]);
      setTotalRevenue(0);
      setSalesByService([]);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/owner/feedback', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          filter: feedbackFilter
        }
      });
      
      const feedback = response.data.feedback || [];
      setFeedbackData(feedback);
      
      const stats = feedback.reduce((acc, fb) => {
        if (fb.rating >= 4) acc.positive++;
        else if (fb.rating <= 2) acc.negative++;
        else acc.neutral++;
        return acc;
      }, { positive: 0, negative: 0, neutral: 0 });
      
      setFeedbackStats(stats);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbackData([]);
      setFeedbackStats({ positive: 0, negative: 0, neutral: 0 });
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/owner/amenities');
      setAmenities(response.data.amenities || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      setAmenities([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-lp-light-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lp-orange mx-auto"></div>
          <p className="mt-4 text-lp-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lp-light-bg">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-lp-orange rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-lp-dark font-header">La Piscina Resort</h1>
                <p className="text-sm text-gray-600">Owner Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3 text-lp-dark">
                <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{user?.username}</span>
                  <span className="text-xs text-gray-500">Owner Access</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'sales', 'feedback', 'amenities'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? 'border-lp-orange text-lp-orange'
                    : 'border-transparent text-lp-dark hover:text-lp-orange hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OwnerOverview 
            totalRevenue={totalRevenue}
            salesData={salesData}
            feedbackData={feedbackData}
            salesByService={salesByService}
            feedbackStats={feedbackStats}
          />
        )}
        
        {activeTab === 'sales' && (
          <OwnerSales 
            salesData={salesData}
            salesByService={salesByService}
            dateRange={dateRange}
            setDateRange={setDateRange}
            chartType={chartType}
            setChartType={setChartType}
          />
        )}
        
        {activeTab === 'feedback' && (
          <OwnerFeedback 
            feedbackData={feedbackData}
            feedbackStats={feedbackStats}
            dateRange={dateRange}
            setDateRange={setDateRange}
            feedbackFilter={feedbackFilter}
            setFeedbackFilter={setFeedbackFilter}
          />
        )}
        
        {activeTab === 'amenities' && (
          <OwnerAmenities 
            amenities={amenities}
            fetchAmenities={fetchAmenities}
          />
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;