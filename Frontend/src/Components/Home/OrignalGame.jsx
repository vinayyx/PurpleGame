import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mineIcon from "../../assets/mineIcon.png";

function OrignalGame() {
  const scrollRef = useRef(null);
  const Navigate = useNavigate();

  const games = [
    {
      name: "Mine",
      players: 3669,
      image: mineIcon,
      path: "/mine",
    },
    {
      name: "Crash",
      players: 82,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      path: "/crash",
    },
    {
      name: "Multiplayer Teen Patti",
      players: 24,
      color: "bg-gradient-to-br from-rose-500 to-red-600",
    },
    {
      name: "Andar Bahar",
      players: 88,
      color: "bg-gradient-to-br from-blue-600 to-indigo-700",
    },
    {
      name: "Rummy",
      players: 94,
      color: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
    {
      name: "Teen Patti 20-20",
      players: 25,
      color: "bg-gradient-to-br from-green-400 to-lime-500",
    },
    {
      name: "Teen Patti Joker",
      players: 24,
      color: "bg-gradient-to-br from-pink-500 to-fuchsia-600",
    },
    {
      name: "Limbo",
      players: 332,
      color: "bg-gradient-to-br from-green-400 to-emerald-600",
    },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = 270;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full md:w-[88vw] mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 ">
        <h2 className="text-start text-white text-xl sm:text-2xl font-bold">
          Ninja <span className="text-purple-500">Originals</span>
        </h2>

        <div className="flex items-center gap-2 md:mr-10">
          <button className="text-white/70 text-sm bg-white/10 border border-white/20 px-3 py-1 rounded-md hover:bg-white/20 transition">
            All
          </button>
          <button
            onClick={() => scroll("left")}
            className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-md transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-md transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth px-2 md:px-0"
      >
        {games.map((game, i) => (
          <div
            key={i}
            onClick={() => game.path && Navigate(game.path)}
            className={`relative rounded-xl w-40 sm:w-44 md:w-52 md:h-64 sm:h-60 h-52 flex-shrink-0 shadow-lg transition-transform hover:scale-[1.03] cursor-pointer overflow-hidden`}
            style={{
              backgroundImage: game.image
                ? `url(${game.image})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Optional overlay (for better text visibility) */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Game Title */}
            <div className="absolute bottom-4 left-0 text-white z-10">
              <div className="flex items-center text-xs text-white/80 mt-1">
                <div className="flex items-center ml-2 gap-1">
                  <Users size={12} />
                  <span>{game.players}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hide Scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default OrignalGame;
