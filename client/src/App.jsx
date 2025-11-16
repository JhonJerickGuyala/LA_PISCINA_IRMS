import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

// I-import mo rin dito ang iba mong pages (Customer, Receptionist, Owner)
import CustomerDashboard from "./pages/customer/CustomerDashboard"; 
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard"; 
import OwnerDashboard from "./pages/owner/OwnerDashboard"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ito ang iyong main login/signup page */}
        <Route path="/" element={<Auth />} />

        {/* --- ITO ANG BAGONG ROUTE PARA SA RESET PASSWORD --- */}
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Ilagay mo rito ang iba mong routes */}
        <Route path="/customer" element={<CustomerDashboard />} /> 
        <Route path="/receptionist" element={<ReceptionistDashboard />} /> 
        <Route path="/owner" element={<OwnerDashboard />} /> 

      </Routes>
    </BrowserRouter>
  );
}

export default App;