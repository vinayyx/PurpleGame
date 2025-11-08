// CrashGameResponsiveFull_Fixed.jsx
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
} from "recharts";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

const formatMoney = (v) =>
  typeof v === "number" ? v.toFixed(2) : parseFloat(v || 0).toFixed(2);
const generateCrashMultiplier = () =>
  parseFloat((Math.random() * 8.99 + 1).toFixed(2));
const createInitialDataPoint = () => ({ x: 0, y: 1.0 });

const CrashGame = () => {
  const [phase, setPhase] = useState("betting");
  const [bet, setBet] = useState("");
  const [autoCashout, setAutoCashout] = useState("");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashMultiplier, setCrashMultiplier] = useState(null);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [history, setHistory] = useState([]);
  const [points, setPoints] = useState([createInitialDataPoint()]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, user: "system", text: "Welcome! Place your bet to start playing." },
  ]);

  // ✅ Bet placed tracking (state + ref)
  const [betPlaced, setBetPlaced] = useState(false);
  const betPlacedRef = useRef(false);

  const bettingIntervalRef = useRef(null);
  const playIntervalRef = useRef(null);
  const playStartRef = useRef(null);
  const crashRef = useRef(null);
  const hasCashedRef = useRef(false);
  const msgIdRef = useRef(100);

  const username = "Player123";

  // --- Betting Countdown ---
  const startBettingWindow = () => {
    setPhase("betting");
    setTimeLeft(10);
    setMultiplier(1.0);
    setPoints([createInitialDataPoint()]);
    setCrashMultiplier(null);
    setHasCashedOut(false);
    setWinnings(0);
    setBetPlaced(false);
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
            toast("⏭️ Round skipped — no bet placed.", { icon: "⚠️" });
            startBettingWindow();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // --- Start Play Round ---
  const startPlayRound = () => {
    const crash = generateCrashMultiplier();
    crashRef.current = crash;
    setCrashMultiplier(crash);
    setPhase("playing");
    setMultiplier(1.0);
    setPoints([createInitialDataPoint()]);
    playStartRef.current = Date.now();

    if (playIntervalRef.current) clearInterval(playIntervalRef.current);

    playIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - playStartRef.current;
      const newMultiplier = parseFloat(Math.exp(elapsedMs / 3000).toFixed(4));

      if (newMultiplier >= crashRef.current) {
        clearInterval(playIntervalRef.current);
        setPoints((prev) => [
          ...prev,
          { x: elapsedMs / 1000, y: crashRef.current },
        ]);

        if (!hasCashedRef.current && betPlacedRef.current) {
          const betVal = parseFloat(bet || 0) || 0;
          toast.error(`💥 Crashed at ${crashRef.current}x — lost ${formatMoney(betVal)}!`);
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
          postGameResult(betVal, 0);
        }

        setPhase("ended");
        setTimeout(() => startBettingWindow(), 3000);
        return;
      }

      setPoints((prev) => {
        const next = [...prev, { x: elapsedMs / 1000, y: newMultiplier }];
        if (next.length > 300) next.shift();
        return next;
      });

      setMultiplier(newMultiplier);

      if (
        autoCashout &&
        parseFloat(autoCashout) > 0 &&
        !hasCashedRef.current &&
        newMultiplier >= parseFloat(autoCashout)
      ) {
        handleCashout(newMultiplier, true);
      }
    }, 60);
  };

  // --- Cashout ---
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

    postGameResult(betVal, winAmount);

    setTimeout(() => startBettingWindow(), 2500);
  };

  // --- API Post ---
  const postGameResult = async (betAmount, winAmount) => {
    try {
      await axios.post(API_URL, {
        username,
        betAmount,
        winAmount,
        lossAmount: winAmount === 0 ? betAmount : 0,
        betId: `BET-${Date.now()}`,
        gameName: "Crash Royale",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  // --- Mount ---
  useEffect(() => {
    startBettingWindow();
    return () => {
      clearInterval(bettingIntervalRef.current);
      clearInterval(playIntervalRef.current);
    };
  }, []);

  // --- Chat Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      msgIdRef.current += 1;
      if (rand < 0.3)
        setMessages((m) => [
          ...m,
          {
            id: msgIdRef.current,
            user: "system",
            text: `Player${Math.floor(Math.random() * 900 + 100)} joined.`,
          },
        ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    msgIdRef.current += 1;
    setMessages((m) => [
      ...m,
      { id: msgIdRef.current, user: "you", text: chatInput.trim() },
    ]);
    setChatInput("");
  };

  // --- Place Bet ---
  const handlePlaceBet = () => {
    if (!bet || parseFloat(bet) <= 0) {
      toast.error("Enter a valid bet amount!");
      return;
    }
    setBetPlaced(true);
    betPlacedRef.current = true;
    toast.success(`✅ Bet placed: ${bet} coins`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-purple-800 text-white p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* --- Left Panel --- */}
          <div className="lg:col-span-4 bg-[rgba(255,255,255,0.05)] rounded-3xl p-6 space-y-5 shadow-lg">
            <h2 className="text-2xl font-bold text-purple-200">Crash Royale 🚀</h2>

            <div>
              <label className="text-sm text-purple-300">Bet Amount</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                disabled={phase !== "betting" || betPlaced}
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
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-md"
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            {/* --- Action Buttons --- */}
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {phase === "betting" && `🕐 ${timeLeft}s to place bet`}
                {phase === "playing" && `${multiplier.toFixed(2)}x`}
                {phase === "ended" && `💥 Crashed @ ${crashMultiplier?.toFixed(2)}x`}
              </div>

              {phase === "betting" && !betPlaced && (
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

          {/* --- Chart --- */}
          <div className="lg:col-span-8 bg-[rgba(255,255,255,0.04)] rounded-3xl p-4 flex h-[50vh] flex-col shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-yellow-400">
                {multiplier.toFixed(2)}x
              </h2>
              <div className="text-purple-300 font-semibold text-lg sm:text-xl uppercase">
                {phase}
              </div>
            </div>

            {/* Chart responsive fix */}
            <div className="flex-1 h-[280px] sm:h-[380px] md:h-[480px] lg:h-[500px] bg-[#0b0c17] rounded-xl overflow-hidden p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points}>
                  <defs>
                    <linearGradient id="colorMult" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#9333ea" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="x" hide />
                  <YAxis hide domain={[1, Math.max(...points.map((p) => p.y), 10) + 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
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
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Chat --- */}
        <div className="bg-[rgba(255,255,255,0.03)] rounded-3xl p-4 flex flex-col max-h-[350px] shadow-inner">
          <h3 className="text-lg font-bold text-purple-200 mb-2">Live Chat 💬</h3>
          <div className="flex-1 overflow-auto mb-3 space-y-2 p-2 bg-[rgba(0,0,0,0.15)] rounded-lg">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-md ${
                  m.user === "you"
                    ? "bg-purple-600 self-end text-white"
                    : m.user === "system"
                    ? "bg-[rgba(255,255,255,0.05)] text-purple-200"
                    : "bg-[rgba(255,255,255,0.08)] text-white"
                }`}
              >
                <div className="text-xs text-purple-300 mb-1">{m.user}</div>
                <div className="text-sm">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 rounded-lg text-black"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
