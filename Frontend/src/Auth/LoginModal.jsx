import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { X } from "lucide-react";
import SignupModal from "./SignupModal";
import { useFetchedUser } from "../Context/UserContext";

function LoginModal({ onCloseLogin }) {
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  //CONTEXT SECTION
  const { refetchUser , setToken} = useFetchedUser();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        formData,
        {
          withCredentials: true,
        }
      );

      //Save Token in Local Stroage & UPDATE THE STATE
      if (res.data.success) {
        localStorage.setItem("token", res.data.accessToken);
        setToken(res.data.accessToken); 
        await refetchUser();
      }

      toast.success("Login successful");
      setTimeout(() => onCloseLogin(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#0d001a] text-white rounded-2xl overflow-hidden flex flex-col md:flex-row w-[90%] max-w-3xl ">
          {/* Left side (image/promo) */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-900 to-fuchsia-800 items-center justify-center p-6">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1604079628043-9431e7a4d4d2?auto=format&fit=crop&w=500&q=80"
                alt="Promo"
                className="rounded-xl shadow-lg"
              />
              <div className="mt-5">
                <h3 className="text-xl font-bold text-purple-200">
                  Welcome Back!
                </h3>
                <p className="text-sm text-purple-300">
                  Log in to continue your journey.
                </p>
              </div>
            </div>
          </div>

          {/* Right form section */}
          <div className="relative flex-1 p-8 md:w-1/2">
            <button
              onClick={onCloseLogin}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-3xl font-bold mb-6 text-purple-400 text-center">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-purple-200 mb-1">
                  Username
                </label>
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
                <label className="block text-sm text-purple-200 mb-1">
                  Password
                </label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center transition-all duration-300"
              >
                {loading ? <ClipLoader size={22} color="#fff" /> : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showSignup && <SignupModal onCloseSingup={() => setShowSignup(false)} />}
    </>
  );
}

export default LoginModal;
