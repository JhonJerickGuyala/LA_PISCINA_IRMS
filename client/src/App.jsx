import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/receptionist" element={<ReceptionistDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
