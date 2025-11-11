import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFetchedUser } from "../Context/UserContext";

function InGameNavbar() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const { loggedInUser } = useFetchedUser();

  useEffect(() => {
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, [loggedInUser]);

  const userBalance = Number(user?.balance || 0).toFixed(2);

  return (
    <nav className="w-full bg-[#120027] border-b border-purple-700/20 sticky top-0 z-30 shadow-[0_2px_10px_rgba(100,50,150,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between">
        {/* Left: Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-400 hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={22} />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </button>

        {/* Right: Balance Display */}
        <div className="text-sm sm:text-base md:text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
          Balance: ₹{userBalance ?? 0}
        </div>
      </div>
    </nav>
  );
}

export default InGameNavbar;
