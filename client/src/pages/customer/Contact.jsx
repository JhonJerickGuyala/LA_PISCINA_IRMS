import React from "react";
import { useAuth } from "../AuthContext";

const Contact = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-lp-light-bg">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-lp-dark mb-6">Contact Us</h1>
        {/* Add your contact form here */}
      </div>
    </div>
  );
};

export default Contact;