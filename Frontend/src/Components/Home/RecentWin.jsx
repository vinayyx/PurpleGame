import React, { useMemo } from "react";

function RecentWin() {
  // Random color backgrounds
  const colors = [
    "bg-gradient-to-br from-purple-500 to-indigo-600",
    "bg-gradient-to-br from-pink-500 to-rose-600",
    "bg-gradient-to-br from-blue-500 to-cyan-600",
    "bg-gradient-to-br from-green-500 to-emerald-600",
    "bg-gradient-to-br from-orange-500 to-red-500",
  ];

  // Random fake data (names + amounts)
  const winners = useMemo(() => {
    const names = [
      "Aman K.",
      "Riya S.",
      "Vikram P.",
      "Sneha M.",
      "Kunal J.",
      "Deepika R.",
      "Sagar T.",
      "Nisha L.",
      "Raj G.",
      "Ankit V.",
    ];
    return Array.from({ length: 15 }, () => ({
      name: names[Math.floor(Math.random() * names.length)],
      amount: `₹${(Math.random() * 10000 + 500).toFixed(0)}`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <section className="w-full md:w-[88vw]  overflow-hidden">
      {/* Heading */}
      <h2 className="text-start text-white text-xl sm:text-2xl font-bold mb-6">
        Recent <span className="text-purple-500">Wins</span>
      </h2>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...winners, ...winners].map((winner, i) => (
            <div
              key={i}
              className={`w-20 sm:w-32 sm:h-40 h-28 mx-2 flex-shrink-0 rounded-md ${winner.color} shadow-lg relative flex flex-col justify-end p-3`}
            >
              <p className="text-white text-[10px] font-semibold align-text-bottom">
                {winner.name}
              </p>
              <p className="text-yellow-300 text-[15px] font-bold align-text-bottom">
                {winner.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Animation Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
        }
      `}</style>
    </section>
  );
}

export default RecentWin;
