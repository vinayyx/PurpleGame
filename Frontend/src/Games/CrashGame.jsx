// CrashGameDarkRoyal.jsx
import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const formatMoney = (v) =>
  typeof v === "number" ? v.toFixed(2) : parseFloat(v || 0).toFixed(2);

const generateCrashMultiplier = () =>
  parseFloat((Math.random() * 8.99 + 1).toFixed(2));

const createInitialDataPoint = () => ({ x: 0, y: 0 });

const CrashGame = () => {
  const [phase, setPhase] = useState("betting");
  const [bet, setBet] = useState("");
  const [autoCashout, setAutoCashout] = useState("");
  const [multiplier, setMultiplier] = useState(0);
  const [crashMultiplier, setCrashMultiplier] = useState(null);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [history, setHistory] = useState([]);
  const [points, setPoints] = useState([createInitialDataPoint()]);

  const betPlacedRef = useRef(false);
  const hasCashedRef = useRef(false);
  const crashRef = useRef(null);
  const playIntervalRef = useRef(null);
  const bettingIntervalRef = useRef(null);
  const playStartRef = useRef(null);

  const startBettingWindow = () => {
    setPhase("betting");
    setTimeLeft(10);
    setMultiplier(0);
    setPoints([createInitialDataPoint()]);
    setCrashMultiplier(null);
    setHasCashedOut(false);
    setWinnings(0);
    betPlacedRef.current = false;
    hasCashedRef.current = false;

    if (bettingIntervalRef.current) clearInterval(bettingIntervalRef.current);
    bettingIntervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(bettingIntervalRef.current);
          if (betPlacedRef.current) {
            startPlayRound();
          } else {
            toast("⏭️ No bet placed — skipping round", { icon: "⚠️" });
            startBettingWindow();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const startPlayRound = () => {
    const crash = generateCrashMultiplier();
    crashRef.current = crash;
    setCrashMultiplier(crash);
    setPhase("playing");
    setMultiplier(0);
    setPoints([createInitialDataPoint()]);
    playStartRef.current = Date.now();

    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    playIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - playStartRef.current;
      const elapsedSec = elapsedMs / 1000;

      // exponential multiplier growth
      const newMultiplier = parseFloat((1.002 ** (elapsedSec * 200)).toFixed(3));

      // crash check
      if (newMultiplier >= crashRef.current) {
        clearInterval(playIntervalRef.current);
        if (!hasCashedRef.current && betPlacedRef.current) {
          const betVal = parseFloat(bet || 0) || 0;
          toast.error(
            `💥 Crashed at ${crashRef.current}x — lost ${formatMoney(betVal)}!`
          );
          setHistory((h) => [
            {
              time: new Date(),
              bet: betVal,
              cashout: 0,
              crashedAt: crashRef.current,
              win: 0,
            },
            ...h,
          ]);
        }
        setPhase("ended");
        setTimeout(() => startBettingWindow(), 3000);
        return;
      }

      // ✅ diagonal growth (both X and Y increase)
      const newX = elapsedSec * 2;
      const newY = newMultiplier;

      setPoints((prev) => [...prev, { x: newX, y: newY }]);
      setMultiplier(newY);

      // auto cashout
      if (
        autoCashout &&
        parseFloat(autoCashout) > 0 &&
        !hasCashedRef.current &&
        newMultiplier >= parseFloat(autoCashout)
      ) {
        handleCashout(newMultiplier, true);
      }
    }, 100);
  };

  const handleCashout = (currentMultiplier = multiplier, isAuto = false) => {
    if (phase !== "playing" || hasCashedRef.current) return;

    hasCashedRef.current = true;
    setHasCashedOut(true);
    setPhase("ended");
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);

    const betVal = parseFloat(bet || 0) || 0;
    const winAmount = parseFloat((betVal * currentMultiplier).toFixed(2));
    setWinnings(winAmount);

    toast.success(
      `${isAuto ? "Auto" : "Manual"} Cashout @ ${currentMultiplier.toFixed(
        2
      )}x — Won ${formatMoney(winAmount)}!`
    );

    setHistory((h) => [
      {
        time: new Date(),
        bet: betVal,
        cashout: currentMultiplier,
        crashedAt: crashRef.current,
        win: winAmount,
      },
      ...h,
    ]);

    setTimeout(() => startBettingWindow(), 2500);
  };

  useEffect(() => {
    startBettingWindow();
    return () => {
      clearInterval(bettingIntervalRef.current);
      clearInterval(playIntervalRef.current);
    };
  }, []);

  const handlePlaceBet = () => {
    if (!bet || parseFloat(bet) <= 0) {
      toast.error("Enter a valid bet amount!");
      return;
    }
    betPlacedRef.current = true;
    toast.success(`✅ Bet placed: ${bet} coins`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#130720] via-[#1a082c] to-[#2d0a4b] text-white p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 bg-[rgba(255,255,255,0.06)] rounded-3xl p-6 space-y-5 shadow-xl border border-purple-800/30 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-purple-300">
              Crash Royale 🚀
            </h2>

            <div>
              <label className="text-sm text-purple-300">Bet Amount</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                disabled={phase !== "betting"}
                className="w-full mt-2 p-2 rounded-lg text-black"
                placeholder="e.g. 10.00"
              />
            </div>

            <div>
              <label className="text-sm text-purple-300">Auto Cashout</label>
              <input
                type="number"
                step="0.01"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                disabled={phase !== "betting"}
                className="w-full mt-2 p-2 rounded-lg text-black"
                placeholder="e.g. 2.00"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {[1.5, 2, 3, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setAutoCashout(m.toString())}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-500 rounded-md"
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {phase === "betting" && `🕐 ${timeLeft}s to bet`}
                {phase === "playing" && `${multiplier.toFixed(2)}x`}
                {phase === "ended" &&
                  `💥 Crashed @ ${crashMultiplier?.toFixed(2)}x`}
              </div>

              {phase === "betting" && (
                <button
                  onClick={handlePlaceBet}
                  className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg text-black font-bold"
                >
                  Place Bet
                </button>
              )}

              {phase === "playing" && !hasCashedOut && (
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold text-black"
                  onClick={() => handleCashout()}
                >
                  Cashout
                </button>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-8 bg-[rgba(255,255,255,0.05)] rounded-3xl p-4 h-[60vh] shadow-xl border border-purple-800/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-5xl font-extrabold text-purple-400 drop-shadow-lg">
                {multiplier.toFixed(2)}x
              </h2>
              <div className="text-purple-300 font-semibold text-lg uppercase tracking-wide">
                {phase}
              </div>
            </div>

            <div className="flex-1 h-full bg-[#0a0115] rounded-xl overflow-hidden p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={points}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorMult" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#581c87"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="x" hide />
                  <YAxis
                    hide
                    domain={[0, Math.max(...points.map((p) => p.y), 10) + 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f0937",
                      border: "none",
                      color: "#fff",
                    }}
                    formatter={(v) => [`${v.toFixed(2)}x`, "Multiplier"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="y"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fill="url(#colorMult)"
                    isAnimationActive={false}
                  />

                  {/* 🔴 Crash line indicator */}
                  {phase === "ended" && crashMultiplier && (
                    <ReferenceLine
                      y={crashMultiplier}
                      stroke="red"
                      strokeWidth={2}
                      strokeDasharray="4"
                      label={{
                        position: "right",
                        value: `💥 Crash @ ${crashMultiplier.toFixed(2)}x`,
                        fill: "red",
                        fontSize: 14,
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
