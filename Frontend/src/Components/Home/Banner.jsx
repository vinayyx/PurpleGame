import React from "react";
import ninja from "../../assets/final.png";

function Banner() {
  return (
    <div className="relative w-[95vw] md:w-[88vw] h-[25vh] md:h-[45vh] mx-auto rounded-xl overflow-hidden flex items-center justify-between bg-[#15032B] shadow-[0_0_5px_rgba(130,60,200,0.25)] transition-all duration-500">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-[1]" />

      {/* Text Content */}
      <div className="relative z-[2] text-left text-white px-5 md:px-12 max-w-[60%]">
        <h2 className="text-xl md:text-5xl font-bold mb-4 leading-tight ">
          Unleash the <span className="text-purple-400">Ninja Power</span>
        </h2>
        <p className="text-[10px] md:text-lg font-medium mb-6 text-gray-200">
          Join the ultimate gaming arena and grab your{" "}
          <span className="text-purple-300 font-semibold">
            ₹6,000 Welcome Bonus
          </span>{" "}
          instantly!
        </p>
        <button className="bg-purple-600 hover:bg-purple-900  px-4 py-1 md:px-6 md:py-3 rounded-full text-white font-semibold transition-all duration-300">
          Join Now
        </button>
      </div>

      {/* Ninja Image */}
      <img
        src={ninja}
        alt="Ninja"
        className="absolute rounded-lg right-0 md:right-0 bottom-0 h-[120%] md:h-[110%] object-contain z-[0]"
      />
    </div>
  );
}

export default Banner;
