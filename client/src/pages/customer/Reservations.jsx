
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Reservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAmenity = location.state?.selectedAmenity;

  return (
    <div className="min-h-screen bg-lp-light-bg">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-lp-dark mb-6">Make a Reservation</h1>
        {/* Add your reservation form and logic here */}
      </div>
    </div>
  );
};

export default Reservations;