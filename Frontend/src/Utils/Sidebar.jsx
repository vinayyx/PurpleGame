import React, { useState } from "react";
import { Home, Gamepad2, Gift, Menu, X, Trophy, User } from "lucide-react";

function Sidebar({ onToggle }) {
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => {
    setOpen(!open);
    if (onToggle) onToggle(!open);
  };

  return (
    <div
      className={`hidden md:flex flex-col items-center py-5 h-screen fixed top-0 left-0 z-40
      bg-gradient-to-b from-[#1a052b] via-[#2d0a4b] to-[#130020]
      border-r border-purple-500/30 
      transition-[width] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]
      ${open ? "w-40" : "w-16"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="text-purple-300 hover:text-purple-100 transition-all duration-300 mb-8 mt-2"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Menu Items */}
      <div className="flex flex-col gap-6 text-white w-full px-3 overflow-hidden">
        {[
          { icon: <Home size={20} />, label: "Home" },
          { icon: <Trophy size={20} />, label: "Tournaments" },
          { icon: <Gamepad2 size={20} />, label: "Games" },
          { icon: <Gift size={20} />, label: "Bonuses" },
          { icon: <User size={20} />, label: "Profile" },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 hover:text-purple-400 cursor-pointer transition-all duration-300"
          >
            {item.icon}
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all duration-500 ease-in-out ${
                open
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-5 pointer-events-none"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className={`mt-auto mb-5 text-xs text-gray-400 transition-all duration-500 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        © NinjaGames.in
      </div>
    </div>
  );
}

export default Sidebar;
