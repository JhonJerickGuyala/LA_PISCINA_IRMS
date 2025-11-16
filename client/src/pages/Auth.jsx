import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fade, setFade] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    passwordMatch: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      if (!value.includes("@") || !value.endsWith(".com")) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (!isLogin && (name === "password" || name === "confirmPassword")) {
      if (
        name === "password" &&
        form.confirmPassword &&
        value !== form.confirmPassword
      ) {
        setErrors((prev) => ({ ...prev, passwordMatch: "Passwords do not match" }));
      } else if (
        name === "confirmPassword" &&
        form.password &&
        value !== form.password
      ) {
        setErrors((prev) => ({ ...prev, passwordMatch: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, passwordMatch: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.email || (!isLogin && errors.passwordMatch)) {
      alert("Please fix the errors before continuing.");
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: form.email,
          password: form.password,
        });

        const role = res.data.user.role;
        if (role === "customer") navigate("/customer");
        else if (role === "receptionist") navigate("/receptionist");
        else if (role === "owner") navigate("/owner");
      } else {
        if (form.password !== form.confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        await axios.post("http://localhost:5000/api/auth/signup", {
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        alert("Signup successful! You can now login.");
        handleSwitchMode();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    if (errors.email) {
      alert("Please fix the email format.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: form.email,
      });
      alert("If an account exists for this email, a reset link has been sent.");
      
      setFade(true);
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
        setErrors({ email: "", passwordMatch: "" });
        setFade(false);
      }, 250);
    } catch {
      alert("If an account exists for this email, a reset link has been sent.");
      setFade(true);
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
        setErrors({ email: "", passwordMatch: "" });
        setFade(false);
      }, 250);
    }
  };

  const handleSwitchMode = () => {
    setFade(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsForgotPassword(false); 
      setForm({ username: "", email: "", password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({ email: "", passwordMatch: "" });
      setFade(false);
    }, 250);
  };

  const toggleForgotPassword = () => {
    setFade(true);
    setTimeout(() => {
      setIsForgotPassword(!isForgotPassword);
      setIsLogin(!isForgotPassword);
      setForm({ username: "", email: "", password: "", confirmPassword: "" });
      setErrors({ email: "", passwordMatch: "" });
      setFade(false);
    }, 250);
  };

  return (
    <div
      className="relative flex justify-center items-center h-screen transition-all duration-500"
      style={{
        backgroundImage: `url(/images/bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <form
        onSubmit={
          isForgotPassword ? handleForgotPasswordRequest : handleSubmit
        }
        className={`relative z-10 bg-lp-light-bg/90 p-8 rounded-xl shadow-xl w-96 transition-all duration-300 ${
          fade ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {isForgotPassword ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-gray-600 mt-1">
                Enter your email to receive a reset link.
              </p>
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 mb-2">{errors.email}</p>
            )}
            <button
              type="submit"
              className="w-full p-2 mb-4 rounded bg-lp-orange hover:bg-lp-orange-hover text-white"
            >
              Send Reset Link
            </button>
            <p className="text-center">
              <span
                onClick={toggleForgotPassword}
                className="text-lp-blue cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft size={16} /> Back to Login
              </span>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{isLogin ? "Login" : "Sign Up"}</h1>
              <p className="text-sm text-gray-600 mt-1">
                La Piscina - Integrated Resort Management System
              </p>
            </div>

            {isLogin && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
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
                <div className="text-right mb-4">
                  <span
                    onClick={toggleForgotPassword}
                    className="text-sm text-lp-blue cursor-pointer hover:underline"
                  >
                    Forgot Password?
                  </span>
                </div>
              </>
            )}

            {!isLogin && (
              <>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />

                <div className="mb-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative mb-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
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

                <div className="relative mb-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
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

                {errors.passwordMatch && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.passwordMatch}
                  </p>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full p-2 mb-4 rounded bg-lp-orange hover:bg-lp-orange-hover text-white"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>

            <p className="text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                onClick={handleSwitchMode}
                className="text-lp-blue cursor-pointer"
              >
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </>
        )}
      </form>
    </div>
  );
};

export default Auth;