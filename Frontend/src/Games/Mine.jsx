import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Zap, User, RefreshCw, DollarSign } from "lucide-react";

// 🧠 Assets
import boomImage from "../assets/Boomb.png";
import GemImage from "../assets/Gem.png";
import backgroundMusic from "../assets/music.mp3";
import openMineSound from "../assets/GetCoin.mp3";
import startGameSound from "../assets/gameStrart.mp3";
import bombBlastSound from "../assets/boombblast.mp3";
import cashOut from "../assets/cashout.mp3";

/**
 * Purple Mines Game (5x5)
 * - Background music
 * - Sounds for start, gem collect & bomb blast
 * - Clean modern purple UI
 */

export default function Mine() {
  const TOTAL_CELLS = 25;

  const [username, setUsername] = useState("player1");
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);

  const [tiles, setTiles] = useState(
    Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      revealed: false,
      isMine: false,
    }))
  );

  const [mines, setMines] = useState(new Set());
  const [gameState, setGameState] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [betId, setBetId] = useState(null);
  const [timeOfPlay, setTimeOfPlay] = useState(null);
  const [openedSafeCount, setOpenedSafeCount] = useState(0);

  // 🎵 Audio refs
  const bgMusicRef = useRef(new Audio(backgroundMusic));
  const startSoundRef = useRef(new Audio(startGameSound));
  const gemSoundRef = useRef(new Audio(openMineSound));
  const blastSoundRef = useRef(new Audio(bombBlastSound));
  const cashoutsoundref = useRef(new Audio(cashOut));

  // Background music settings
  useEffect(() => {
    const bg = bgMusicRef.current;
    bg.loop = true;
    bg.volume = 0.25; // low background volume
    return () => {
      bg.pause();
      bg.currentTime = 0;
    };
  }, []);

  const generateMines = (count) => {
    const set = new Set();
    while (set.size < Math.min(count, TOTAL_CELLS - 1)) {
      set.add(Math.floor(Math.random() * TOTAL_CELLS));
    }
    return set;
  };

  const calcMultiplier = (openedSafe, minesNum) => {
    if (openedSafe <= 0) return 1;
    const total = TOTAL_CELLS;
    const denom = total - openedSafe;
    const base = total / denom;
    return Math.pow(base, minesNum);
  };

  const multiplier = useMemo(
    () => calcMultiplier(openedSafeCount, minesCount),
    [openedSafeCount, minesCount]
  );

  const currentProfit = useMemo(
    () => (betAmount * multiplier).toFixed(2),
    [betAmount, multiplier]
  );

  const startGame = async () => {
    setMessage("");
    setLoading(true);
    setGameState("playing");
    setOpenedSafeCount(0);

    // Start background & start game sound
    bgMusicRef.current.play().catch(() => {});
    startSoundRef.current.currentTime = 0;
    startSoundRef.current.play();

    await new Promise((r) => setTimeout(r, 300));
    const m = generateMines(Number(minesCount));
    setMines(m);
    setTiles(
      Array.from({ length: TOTAL_CELLS }, (_, i) => ({
        id: i,
        revealed: false,
        isMine: m.has(i),
      }))
    );
    setBetId(`bet_${Date.now()}`);
    setTimeOfPlay(new Date().toISOString());
    setLoading(false);
    toast.success("🎮 Game started — Good luck!");
  };

  const revealAll = () => {
    setTiles((t) => t.map((cell) => ({ ...cell, revealed: true })));
  };

  const handleTileClick = async (idx) => {
    if (gameState !== "playing") return;
    const cell = tiles[idx];
    if (cell.revealed) return;

    const isBomb = mines.has(idx);
    const updatedTiles = [...tiles];
    updatedTiles[idx] = { ...cell, revealed: true };
    setTiles(updatedTiles);

    if (isBomb) {
      // 🔥 Bomb sound
      blastSoundRef.current.currentTime = 0;
      blastSoundRef.current.play();

      setGameState("lost");
      setMessage("Boom! You hit a mine 💣");
      revealAll();
      toast.error("💣 You Lost the Bet!");
      bgMusicRef.current.pause(); // stop background music
      await sendResult(false, 0);
    } else {
      // 💎 Gem sound
      gemSoundRef.current.currentTime = 0;
      gemSoundRef.current.play();

      const newCount = openedSafeCount + 1;
      setOpenedSafeCount(newCount);
      const safeTotal = TOTAL_CELLS - minesCount;
      if (newCount >= safeTotal) {
        const profit = (
          betAmount * calcMultiplier(newCount, minesCount)
        ).toFixed(2);
        setGameState("won");
        revealAll();
        toast.success(`💎 You Won ₹${profit}`);
        bgMusicRef.current.pause(); // stop music
        await sendResult(true, profit);
      }
    }
  };

  const cashout = async () => {
    //cashOutSong
    cashoutsoundref.current.play();
    if (gameState !== "playing" || openedSafeCount <= 0) return;
    setGameState("cashed");
    const profit = (
      betAmount * calcMultiplier(openedSafeCount, minesCount)
    ).toFixed(2);
    revealAll();
    toast.success(`💰 Cashed Out ₹${profit}`);
    bgMusicRef.current.pause();
    await sendResult(true, profit);
  };

  const sendResult = async (won, profit) => {
    const payload = {
      username,
      betAmount,
      profit: won ? profit : 0,
      betId,
      time: timeOfPlay || new Date().toISOString(),
      result: won ? "won" : "lost",
      mines: minesCount,
      openedSafeCount,
      multiplier,
    };
    try {
      setApiLoading(true);
      await axios.post("https://jsonplaceholder.typicode.com/posts", payload);
    } catch {
      toast.error("⚠️ Failed to record result");
    } finally {
      setApiLoading(false);
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setTiles(
      Array.from({ length: TOTAL_CELLS }, (_, i) => ({
        id: i,
        revealed: false,
        isMine: false,
      }))
    );
    setMines(new Set());
    setMessage("");
    setBetId(null);
    setTimeOfPlay(null);
    setOpenedSafeCount(0);
    bgMusicRef.current.pause();
    bgMusicRef.current.currentTime = 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a002e] to-[#3a0066] text-white p-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto bg-gradient-to-b from-[#230046]/80 to-[#3a0066]/70 backdrop-blur-md rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* GRID */}
          <div className="order-first md:order-last md:w-2/3 p-4 bg-[#15002b]/60 rounded-xl border border-purple-700">
            <div className="grid grid-cols-5 gap-3">
              {tiles.map((t, idx) => {
                const revealed = t.revealed;
                const isMine = t.isMine;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTileClick(idx)}
                    disabled={gameState !== "playing" || revealed}
                    className={`aspect-square rounded-md flex items-center justify-center text-2xl font-semibold transition-all duration-300 shadow-lg ${
                      revealed
                        ? isMine
                          ? "bg-red-600 text-white scale-105"
                          : "bg-purple-500 text-white scale-105"
                        : "bg-[#240046] hover:bg-[#3a0075] border border-purple-700 hover:scale-105"
                    }`}
                  >
                    {revealed ? (
                      isMine ? (
                        <img
                          src={boomImage}
                          alt="Boom"
                          className="w-10 h-10 animate-pulse"
                        />
                      ) : (
                        <img
                          src={GemImage}
                          alt="Gem"
                          className="w-10 h-10 animate-bounce"
                        />
                      )
                    ) : (
                      ""
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="order-last md:order-first md:w-1/3 bg-[#1a0033]/70 p-4 rounded-xl border border-purple-700">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-300" />
              <h2 className="text-xl font-semibold">Purple Mines</h2>
            </div>

            <label className="block text-sm">Username</label>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-purple-200" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border border-purple-500/30 rounded-md p-2 text-sm"
              />
            </div>

            <label className="block text-sm">Bet Amount (₹)</label>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-transparent border border-purple-500/30 rounded-md p-2 text-sm mb-3"
            />

            <label className="block text-sm">Number of Mines</label>
            <input
              type="range"
              min="1"
              max="20"
              value={minesCount}
              onChange={(e) => setMinesCount(Number(e.target.value))}
              className="w-full mb-2"
            />
            <div className="text-xs mb-4">Mines: {minesCount}</div>

            <div className="text-sm mb-2">
              Multiplier: <b>{multiplier.toFixed(4)}×</b>
            </div>
            <div className="text-sm mb-4">Current Profit: ₹{currentProfit}</div>

            <div className="flex gap-2">
              <button
                onClick={startGame}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-black font-semibold rounded-lg"
              >
                {loading ? <ClipLoader size={18} /> : "Start Game"}
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 border border-purple-700 rounded-lg text-sm hover:bg-purple-900/30"
              >
                <RefreshCw className="w-4 h-4 inline-block mr-2" /> Reset
              </button>
            </div>

            <button
              onClick={cashout}
              disabled={openedSafeCount <= 0 || gameState !== "playing"}
              className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                openedSafeCount > 0 && gameState === "playing"
                  ? "bg-green-500 text-black"
                  : "bg-gray-600/40 text-gray-300 cursor-not-allowed"
              }`}
            >
              <DollarSign className="w-4 h-4" /> Cashout ₹{currentProfit}
            </button>
          </div>
        </div>

        <div className="text-center text-xs opacity-60 mt-4">
          Made with ❤️ React + Tailwind + Hot Toast
        </div>
      </div>
    </div>
  );
}
