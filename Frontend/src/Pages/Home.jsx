import React, { useState } from "react";
import Navbar from "../Utils/Navbar";
import Sidebar from "../Utils/Sidebar";
import Banner from "../Components/Home/Banner";
import RecentWin from "../Components/Home/RecentWin";
import OrignalGame from "../Components/Home/OrignalGame";

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative flex bg-[#0B0014] text-white min-h-screen overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar onToggle={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex flex-col items-center gap-5 w-full transition-all duration-500 ${
          sidebarOpen ? "md:ml-48" : "md:ml-14"
        }`}
      >
        <Navbar />
        <Banner />
        <RecentWin/>
        <OrignalGame/>
      </div>
    </div>
  );
}

export default Home;
