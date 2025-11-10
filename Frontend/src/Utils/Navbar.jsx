import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import SignupModal from "../Auth/SignupModal";
import LoginModal from "../Auth/LoginModal";

function Navbar() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      <nav className="w-full bg-[#120027] border-b border-purple-700/20 sticky top-0 z-30 shadow-[0_2px_10px_rgba(100,50,150,0.25)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="text-white text-lg sm:text-xl md:text-2xl font-extrabold whitespace-nowrap">
            <span className="text-purple-500">Ninja</span>Games.in
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full bg-transparent border border-purple-500 text-[12px] sm:text-sm md:text-base text-purple-400 font-medium hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              Sign In
            </button>

            <button
              onClick={() => setShowSignup(true)}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full bg-purple-600 text-[12px] sm:text-sm md:text-base text-white font-medium hover:bg-purple-700 transition-all duration-300"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {showSignup && <SignupModal onCloseSingup={() => setShowSignup(false)} />}
      {showLogin && <LoginModal onCloseLogin={() => setShowLogin(false)} />}
    </>
  );
}

export default Navbar;
