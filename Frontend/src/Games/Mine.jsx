import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Zap, RefreshCw, DollarSign } from "lucide-react";

import boomImage from "../assets/Boomb.png";
import GemImage from "../assets/Gem.png";
import backgroundMusic from "../assets/music.mp3";
import openMineSound from "../assets/GetCoin.mp3";
import startGameSound from "../assets/gameStrart.mp3";
import bombBlastSound from "../assets/boombblast.mp3";
import cashOutSound from "../assets/cashout.mp3";

const API = "http://localhost:4000/api/game/mine";

export default function Mine() {
  const TOTAL_CELLS = 25;
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [tiles, setTiles] = useState(
    Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      revealed: false,
      isMine: false,
    }))
  );
  const [gameId, setGameId] = useState(null);
  const [gameStatus, setGameStatus] = useState("idle");
  const [openedSafeCount, setOpenedSafeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [user, setUser] = useState({});

  // sounds
  const bgMusicRef = useRef(new Audio(backgroundMusic));
  const startSoundRef = useRef(new Audio(startGameSound));
  const gemSoundRef = useRef(new Audio(openMineSound));
  const blastSoundRef = useRef(new Audio(bombBlastSound));
  const cashoutRef = useRef(new Audio(cashOutSound));

  // ✅ Load user from localStorage (with token)
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
        setUserBalance(storedUser.balance || 0);
      }
    }
  }, [token]);

  // ✅ Keep background music settings
  useEffect(() => {
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.25;
    return () => {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    };
  }, []);

  // ✅ Dynamic Multiplier & Profit
  const multiplier = useMemo(() => {
    if (openedSafeCount <= 0) return 1;
    const total = TOTAL_CELLS;
    const denom = total - openedSafeCount;
    const base = total / denom;
    return Math.pow(base, minesCount);
  }, [openedSafeCount, minesCount]);

  const currentProfit = useMemo(
    () => (betAmount * multiplier).toFixed(2),
    [betAmount, multiplier]
  );

  // ✅ Start Game
  const startGame = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/start`, {
        username: user.username,
        betAmount,
        minesCount,
      });
      const { gameId: gid } = res.data;
      setGameId(gid);
      setGameStatus("playing");
      setOpenedSafeCount(0);
      setTiles(
        Array.from({ length: TOTAL_CELLS }, (_, i) => ({
          id: i,
          revealed: false,
          isMine: false,
        }))
      );

      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play();
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});

      // ✅ Refresh balance from server
      const userRes = await axios.post(`${API}/checkUser`, { username: user.username });
      setUserBalance(userRes.data.user.balance);

      toast.success("Game started");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open cell logic
  const openCell = async (idx) => {
    if (!gameId || gameStatus !== "playing") return;
    if (tiles[idx].revealed) return;

    try {
      const res = await axios.post(`${API}/openCell`, { gameId, index: idx });
      const { isMine, revealed, openedSafeCount: opened, status, profit, mines } = res.data;

      let updatedTiles = [];

      if (status === "lost") {
        updatedTiles = tiles.map((c) => ({
          ...c,
          revealed: true,
          isMine: mines.includes(c.id),
        }));
      } else {
        updatedTiles = tiles.map((c) => ({
          ...c,
          revealed: revealed.includes(c.id),
          isMine: false,
        }));
      }

      setTiles(updatedTiles);
      setOpenedSafeCount(opened);
      setGameStatus(status);

      if (isMine) {
        blastSoundRef.current.currentTime = 0;
        blastSoundRef.current.play();
        bgMusicRef.current.pause();
        toast.error("💣 You hit a mine! Game Over!");
      } else {
        gemSoundRef.current.currentTime = 0;
        gemSoundRef.current.play();

        if (status === "won") {
          bgMusicRef.current.pause();
          toast.success(`🎉 You won ₹${profit}`);
        }
      }

      // ✅ Update balance
      const userRes = await axios.post(`${API}/checkUser`, { username: user.username });
      setUserBalance(userRes.data.user.balance);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Open failed");
    }
  };

  // ✅ Cashout
  const cashout = async () => {
    if (!gameId || gameStatus !== "playing") return;
    try {
      const res = await axios.post(`${API}/cashOut`, { gameId });
      const { profit } = res.data;
      cashoutRef.current.currentTime = 0;
      cashoutRef.current.play();
      bgMusicRef.current.pause();
      setGameStatus("cashed");
      setTiles((prev) => prev.map((c) => ({ ...c, revealed: true })));
      toast.success(`Cashed out ₹${profit}`);

      // ✅ Refresh balance
      const userRes = await axios.post(`${API}/checkUser`, { username: user.username });
      setUserBalance(userRes.data.user.balance);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Cashout failed");
    }
  };

  const resetGame = () => {
    setGameId(null);
    setGameStatus("idle");
    setTiles(
      Array.from({ length: TOTAL_CELLS }, (_, i) => ({
        id: i,
        revealed: false,
        isMine: false,
      }))
    );
    setOpenedSafeCount(0);
    bgMusicRef.current.pause();
    bgMusicRef.current.currentTime = 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a103d] to-[#000000] text-white flex items-center justify-center p-6">
      <Toaster position="top-center" />
      <div className="max-w-6xl w-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl overflow-hidden p-6 flex flex-col md:flex-row gap-8">
        {/* GRID */}
        <div className="flex-1 bg-[#1a103d]/60 border border-purple-700/40 rounded-xl p-5 grid grid-cols-5 gap-2.5">
          {tiles.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => openCell(idx)}
              disabled={gameStatus !== "playing" || t.revealed}
              className={`aspect-square rounded-md flex items-center justify-center transition-all duration-200 ease-out shadow-lg ${
                t.revealed
                  ? t.isMine
                    ? "bg-gradient-to-br from-red-600 to-red-800"
                    : "bg-gradient-to-br from-purple-500 to-purple-700"
                  : "bg-gradient-to-br from-[#1c0045] to-[#2a0066] hover:brightness-125 border border-purple-900/40 hover:shadow-[0_0_12px_#7e22ce50]"
              }`}
            >
              {t.revealed && (
                <img
                  src={t.isMine ? boomImage : GemImage}
                  alt={t.isMine ? "Mine" : "Gem"}
                  className="w-9 h-9 transition-transform duration-300 transform hover:scale-110"
                />
              )}
            </button>
          ))}
        </div>

        {/* CONTROL PANEL */}
        <div className="w-full md:w-1/3 bg-[#1a103d]/70 border border-purple-700/40 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold tracking-wide">
                  Mines Game
                </h2>
              </div>
              <div className="text-sm text-right">
                <div>Balance</div>
                <div className="font-semibold">₹{userBalance ?? "—"}</div>
              </div>
            </div>

            <div className="text-sm opacity-80 mb-2">
              Logged in as: <b className="text-purple-400">{user.username}</b>
            </div>

            <label className="text-sm opacity-80">Bet Amount (₹)</label>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-white/10 border border-purple-500/30 rounded-md p-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-purple-400"
            />

            <label className="text-sm opacity-80">
              Number of Mines: {minesCount}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={minesCount}
              onChange={(e) => setMinesCount(Number(e.target.value))}
              className="w-full accent-purple-500 mb-4"
            />

            <div className="text-sm space-y-1">
              <div>
                Multiplier:{" "}
                <b className="text-purple-400">{multiplier.toFixed(4)}×</b>
              </div>
              <div>Current Profit: ₹{currentProfit}</div>
              <div className="text-xs text-gray-300 mt-2">
                Game state: {gameStatus}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={startGame}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-400 text-black font-semibold rounded-md py-2 hover:scale-[1.02] transition-all"
              >
                {loading ? <ClipLoader size={18} /> : "Start Game"}
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 border border-purple-500/50 rounded-md text-sm hover:bg-purple-900/30"
              >
                <RefreshCw className="w-4 h-4 inline-block mr-2" /> Reset
              </button>
            </div>

            <button
              onClick={cashout}
              disabled={
                !gameId || gameStatus !== "playing" || openedSafeCount <= 0
              }
              className={`w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                openedSafeCount > 0 && gameStatus === "playing"
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-black hover:scale-[1.02]"
                  : "bg-gray-600/40 text-gray-300 cursor-not-allowed"
              }`}
            >
              <DollarSign className="w-4 h-4" /> Cashout ₹{currentProfit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
