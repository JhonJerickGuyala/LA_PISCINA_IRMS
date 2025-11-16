import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time password match check
    if (name === "confirmPassword" && form.password && value !== form.password) {
      setErrors("Passwords do not match");
    } else if (name === "password" && form.confirmPassword && value !== form.confirmPassword) {
      setErrors("Passwords do not match");
    } else {
      setErrors("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = searchParams.get("token");

    if (!token) {
      alert("Invalid or missing reset token.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrors("Passwords do not match");
      return;
    }

    if (errors) {
      alert("Please fix the errors.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token: token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      alert("Password has been reset successfully! You can now login.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Password reset failed. The link may be expired.");
    }
  };

  return (
    <div
      className="relative flex justify-center items-center h-screen"
      style={{
        backgroundImage: `url(/images/bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-lp-light-bg/90 p-8 rounded-xl shadow-xl w-96"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter your new password below.
          </p>
        </div>

        {/* Password */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded pr-10"
            required
          />
          {form.password && (
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative mb-2">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded pr-10"
            required
          />
          {form.confirmPassword && (
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          )}
        </div>

        {/* Password Match Error */}
        {errors && (
          <p className="text-red-500 text-sm mt-1">{errors}</p>
        )}

        <button
          type="submit"
          className="w-full p-2 mt-4 mb-4 rounded bg-lp-orange hover:bg-lp-orange-hover text-white"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;