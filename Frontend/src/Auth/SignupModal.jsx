import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { X } from "lucide-react";

const API_BASE = "http://localhost:4000/api";

function SignupModal({ onCloseSingup }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/register`, formData, { withCredentials: true });
      toast.success("Account created successfully!");
      setTimeout(() => onCloseSingup(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Toaster position="top-center" />
      <div className="bg-[#0d001a] text-white rounded-2xl overflow-hidden flex flex-col md:flex-row w-[90%] max-w-3xl shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-[fadeIn_0.3s_ease]">
        
        {/* Left image / promo section */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-900 to-fuchsia-800 items-center justify-center p-6">
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1604079628043-9431e7a4d4d2?auto=format&fit=crop&w=500&q=80"
              alt="Promo"
              className="rounded-xl shadow-lg"
            />
            <div className="mt-5">
              <h3 className="text-xl font-bold text-purple-200">Join Now & Win</h3>
              <p className="text-sm text-purple-300">Sign up to claim your bonus rewards!</p>
            </div>
          </div>
        </div>

        {/* Right signup form */}
        <div className="relative flex-1 p-8 md:w-1/2">
          <button
            onClick={onCloseSingup}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>

          <h2 className="text-3xl font-bold mb-6 text-purple-400 text-center">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-purple-200 mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#1a0029]/60 border border-purple-700/40 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-600 focus:outline-none placeholder-purple-400/60"
              />
            </div>

            <div>
              <label className="block text-sm text-purple-200 mb-1">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#1a0029]/60 border border-purple-700/40 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-600 focus:outline-none placeholder-purple-400/60"
              />
            </div>

            <div>
              <label className="block text-sm text-purple-200 mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#1a0029]/60 border border-purple-700/40 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-600 focus:outline-none placeholder-purple-400/60"
              />
            </div>

            <div className="flex flex-col gap-2 text-sm text-purple-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" required className="accent-fuchsia-600" />
                I agree to the <span className="text-fuchsia-400">User Agreement</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-fuchsia-600" />
                I agree to receive promotional updates
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center transition-all duration-300"
            >
              {loading ? <ClipLoader size={22} color="#fff" /> : "Sign Up"}
            </button>

            <p className="text-center text-sm mt-3 text-purple-300">
              Already have an account?{" "}
              <span className="text-fuchsia-400 cursor-pointer hover:underline">
                Sign In
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;
