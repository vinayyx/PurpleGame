import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Zap, RefreshCw, DollarSign } from "lucide-react";
import { useFetchedUser } from "../Context/UserContext";

import boomImage from "../assets/Boomb.png";
import GemImage from "../assets/Gem.png";
import backgroundMusic from "../assets/music.mp3";
import openMineSound from "../assets/GetCoin.mp3";
import startGameSound from "../assets/gameStrart.mp3";
import bombBlastSound from "../assets/boombblast.mp3";
import cashOutSound from "../assets/cashout.mp3";

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

  const { loggedInUser, refetchUser } = useFetchedUser();

  useEffect(() => {
    if (loggedInUser) {
      setUser(loggedInUser);
      setUserBalance(loggedInUser?.balance.toFixed(2));
    }
  }, [loggedInUser]);

  // Keep background music settings
  useEffect(() => {
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.25;
    return () => {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    };
  }, []);

  // Dynamic Multiplier & Profit (logic unchanged)
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

  // Start Game
  const startGame = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/game/mine/start`,
        {
          username: user.username,
          betAmount,
          minesCount,
        }
      );
      const { gameId: gid } = res.data;
      refetchUser();
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
      startSoundRef.current.play().catch(() => {});
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});

      // Refresh balance
      const userRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/game/mine/checkUser`,
        { username: user.username }
      );
      setUserBalance(userRes.data.user.balance);
      refetchUser();

      toast.success("Game started");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  // Open cell logic
  const openCell = async (idx) => {
    if (!gameId || gameStatus !== "playing") return;
    if (tiles[idx].revealed) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/game/mine/openCell`,
        { gameId, index: idx }
      );
      const {
        isMine,
        revealed,
        openedSafeCount: opened,
        status,
        profit,
        mines,
      } = res.data;

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
        blastSoundRef.current.play().catch(() => {});
        bgMusicRef.current.pause();
        toast.error("💣 You hit a mine! Game Over!");
      } else {
        gemSoundRef.current.currentTime = 0;
        gemSoundRef.current.play().catch(() => {});

        if (status === "won") {
          bgMusicRef.current.pause();
          toast.success(`🎉 You won ₹${profit}`);
        }
      }

      // Update balance
      const userRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/game/mine/checkUser`,
        { username: user.username }
      );
      setUserBalance(userRes.data.user.balance);
      refetchUser();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Open failed");
    }
  };

  // Cashout
  const cashout = async () => {
    if (!gameId || gameStatus !== "playing") return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/game/mine/cashOut`,
        { gameId }
      );
      const { profit } = res.data;
      cashoutRef.current.currentTime = 0;
      cashoutRef.current.play().catch(() => {});
      bgMusicRef.current.pause();
      setGameStatus("cashed");
      refetchUser();
      setTiles((prev) => prev.map((c) => ({ ...c, revealed: true })));
      toast.success(`Cashed out ₹${profit}`);

      // Refresh balance
      const userRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/game/mine/checkUser`,
        { username: user.username }
      );
      setUserBalance(userRes.data.user.balance);
      refetchUser();
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

  // Helper: display for tile classes (UI only)
  const tileClass = (t) => {
    if (t.revealed) {
      return t.isMine
        ? "bg-gradient-to-br from-red-600 to-red-800 border-red-800 shadow-[0_6px_20px_rgba(220,38,38,0.18)]"
        : "bg-gradient-to-br from-purple-600 to-purple-800 border-purple-900 shadow-[0_6px_20px_rgba(124,58,237,0.18)]";
    }
    return "bg-[#232323] hover:brightness-110 border border-[#2b2b2b] hover:shadow-[0_0_16px_rgba(124,58,237,0.09)]";
  };

  return (
    <div className="min-h-[91vh] bg-[#0b0b0b] text-white flex items-center justify-center p-4">

      <div className="w-full h-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left control panel: md:col-span-4 */}
        <div className="md:col-span-4  md:h-[85vh] col-span-1 bg-[#171717] rounded-2xl border border-[#232323] p-5 flex flex-col justify-between shadow-xl">
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-4 border-b border-[#252525] pb-3">
              <button className="text-sm font-semibold text-purple-300 border-b-2 border-purple-500 pb-2">
                Manual
              </button>
              <button className="text-sm text-gray-400">Auto</button>
            </div>

            {/* Amount row */}
            <label className="text-xs text-gray-400">Amount</label>
            <div className="mt-2 mb-3 flex items-center gap-2">
              <div className="bg-[#1f1f1f] px-3 py-2 rounded-md flex items-center gap-2 border border-[#2c2c2c]">
                <span className="text-sm">🇮🇳</span>
                <input
                  type="number"
                  min="0"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-transparent outline-none text-white w-28 sm:w-full text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button className="px-2 py-2 bg-[#1f1f1f] text-xs rounded-md border border-[#2b2b2b] hover:bg-[#2a1e3d] hover:text-white transition">
                  1/2
                </button>
                <button className="px-2 py-2 bg-[#1f1f1f] text-xs rounded-md border border-[#2b2b2b] hover:bg-[#2a1e3d] hover:text-white transition">
                  2×
                </button>
              </div>
            </div>

            {/* Quick amount chips */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {["10", "100", "1k", "10k"].map((v) => (
                <button
                  key={v}
                  onClick={() => setBetAmount(Number(v.replace("k", "000")))}
                  className="py-2 text-sm bg-[#1a1a1a] rounded-md border border-[#2b2b2b] hover:bg-[#262626] transition"
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Mines slider */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Mines</span>
                <span className="text-white font-medium">{minesCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={minesCount}
                onChange={(e) => setMinesCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Info */}
            <div className="text-sm text-gray-300 space-y-2 mb-4">
              <div>
                Multiplier:{" "}
                <span className="text-purple-300 font-semibold">
                  {multiplier.toFixed(4)}×
                </span>
              </div>
              <div>Current Profit: ₹{currentProfit}</div>
              <div className="text-xs text-gray-500">
                Game state: {gameStatus}
              </div>
            </div>

            {/* Big Bet button */}
            <div className="mb-3">
              <button
                onClick={startGame}
                disabled={loading || gameStatus === "playing"}
                className={`w-full py-3 rounded-full font-semibold text-black shadow-lg transition transform ${
                  loading || gameStatus === "playing"
                    ? "bg-purple-400/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-purple-700 hover:scale-[1.02] hover:brightness-105"
                }`}
              >
                {loading ? <ClipLoader size={18} color="#000" /> : "Bet"}
              </button>
              <div className="mt-3 text-center text-xs text-gray-400">
                Betting with 0 will enter demo mode.
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Balance</div>
                <div className="font-semibold">₹{userBalance ?? "—"}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Player</div>
                <div className="text-purple-300 font-medium">
                  {user.username || "—"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetGame}
                className="flex-1 py-2 rounded-md border border-[#2b2b2b] hover:bg-[#232026] transition flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={cashout}
                disabled={
                  !gameId || gameStatus !== "playing" || openedSafeCount <= 0
                }
                className={`py-2 px-4 rounded-md font-semibold text-sm transition ${
                  openedSafeCount > 0 && gameStatus === "playing"
                    ? "bg-gradient-to-r from-green-400 to-green-600 text-black"
                    : "bg-[#313131] text-gray-400 cursor-not-allowed"
                }`}
              >
                <DollarSign className="w-4 h-4 inline-block mr-1" />
                Cashout ₹{currentProfit}
              </button>
            </div>
          </div>
        </div>

        {/* Right game area: md:col-span-8 */}
        <div className="md:col-span-8  col-span-1 flex flex-col gap-4">
          {/* Top multiplier badges (responsive) */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-md bg-[#252525] text-xs text-gray-300">
              0×
            </div>
            <div className="px-3 py-2 rounded-md bg-green-700 text-white text-xs font-semibold">
              5.2×
            </div>
            <div className="px-3 py-2 rounded-md bg-green-700 text-white text-xs font-semibold">
              1.69×
            </div>
            <div className="px-3 py-2 rounded-md bg-green-700 text-white text-xs font-semibold">
              1.16×
            </div>
            <div className="ml-auto text-sm text-gray-400 hidden sm:block">
              Opened:{" "}
              <span className="text-white font-medium">{openedSafeCount}</span>
            </div>
          </div>

          {/* Game board container */}
          <div className="flex-1  bg-[#151515] rounded-2xl border border-[#242424] p-2 shadow-inner">
            <div className="w-full max-w-md md:max-w-lg mx-auto">
              <div className="grid grid-cols-5 gap-3">
                {tiles.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => openCell(idx)}
                    disabled={gameStatus !== "playing" || t.revealed}
                    className={`${tileClass(
                      t
                    )} aspect-square rounded-md flex items-center justify-center transition-all duration-200 ease-out`}
                  >
                    {t.revealed ? (
                      <img
                        src={t.isMine ? boomImage : GemImage}
                        alt={t.isMine ? "Mine" : "Gem"}
                        className="w-8 h-8"
                      />
                    ) : (
                      // covered tile icon (simple dot or nothing)
                      <div className="w-0 h-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer: small notes (mobile friendly) */}
          <div className="text-xs text-gray-500 text-center md:text-left">
            Tip: Open safe tiles to increase multiplier. Avoid mines!
          </div>
        </div>
      </div>
    </div>
  );
}
