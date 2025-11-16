import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/AuthContext";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Reservations from "./pages/customer/Reservations";
import Feedback from "./pages/customer/Feedback";
import Contact from "./pages/customer/Contact";
import Amenities from "./pages/customer/Amenities";

// I-import mo rin dito ang iba mong pages (Customer, Receptionist, Owner)
import CustomerDashboard from "./pages/customer/CustomerDashboard"; 
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard"; 
import OwnerDashboard from "./pages/owner/OwnerDashboard"; 

// =======================================================
//          BAGONG PROTECTED ROUTE COMPONENT
// =======================================================
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lp-orange"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// =======================================================
//          UNAUTHORIZED PAGE COMPONENT
// =======================================================
const UnauthorizedPage = () => {
  const { logout } = useAuth();
  
  const handleGoBack = () => {
    window.history.back();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page with your current role.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleGoBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={handleLogout}
            className="bg-lp-orange hover:bg-lp-orange-hover text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider> {/* I-wrap ang buong app sa AuthProvider */}
      <BrowserRouter>
        <Routes>
          {/* Ito ang iyong main login/signup page */}
          <Route path="/" element={<Auth />} />

          {/* --- ITO ANG BAGONG ROUTE PARA SA RESET PASSWORD --- */}
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* ======================================================= */}
          {/*          BAGONG PROTECTED ROUTES WITH AUTH              */}
          {/* ======================================================= */}
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          /> 
          <Route 
            path="/receptionist" 
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistDashboard />
              </ProtectedRoute>
            } 
          /> 
          <Route 
            path="/owner" 
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          /> 

          {/* ======================================================= */}
          {/*          BAGONG CUSTOMER PAGES ROUTES                   */}
          {/* ======================================================= */}
          <Route 
            path="/amenities" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Amenities />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Reservations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Feedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <ProtectedRoute requiredRole="customer">
                <Contact />
              </ProtectedRoute>
            } 
          />

          {/* ======================================================= */}
          {/*          BAGONG ROUTES FOR ERROR HANDLING               */}
          {/* ======================================================= */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Fallback route - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;