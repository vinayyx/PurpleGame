// Plinko.jsx
import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const PlinkoGame = () => {
  const sceneRef = useRef(null);
  const engineRef = useRef(Matter.Engine.create());
  const [bet, setBet] = useState(10);
  const [rows, setRows] = useState(12);
  const [risk, setRisk] = useState("medium");
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(null);

  const multipliers = {
    low: [1.2, 1.5, 2, 3, 5, 10, 5, 3, 2, 1.5, 1.2],
    medium: [0.5, 1, 2, 4, 8, 16, 8, 4, 2, 1, 0.5],
    high: [0, 0.5, 1, 3, 7, 25, 7, 3, 1, 0.5, 0],
  };

  // build plinko board
  useEffect(() => {
    const { Engine, Render, Runner, World, Bodies } = Matter;
    const engine = engineRef.current;
    const world = engine.world;

    // Clear any old world before re-render
    World.clear(world);
    Engine.clear(engine);

    world.gravity.y = 1;

    const render = Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width: 500,
        height: 600,
        wireframes: false,
        background: "#0f172a",
      },
    });

    // boundaries
    const ground = Bodies.rectangle(250, 590, 500, 20, {
      isStatic: true,
      render: { fillStyle: "#1e293b" },
    });
    const leftWall = Bodies.rectangle(5, 300, 10, 600, { isStatic: true });
    const rightWall = Bodies.rectangle(495, 300, 10, 600, { isStatic: true });
    Matter.World.add(world, [ground, leftWall, rightWall]);

    // pegs
    const spacing = 500 / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= r; c++) {
        const x = 250 - (r * spacing) / 2 + c * spacing;
        const y = 80 + r * 35;
        const peg = Bodies.circle(x, y, 5, {
          isStatic: true,
          render: { fillStyle: "#94a3b8" },
        });
        World.add(world, peg);
      }
    }

    Matter.Render.run(render);
    const runner = Matter.Runner.run(engine);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [rows]);

  // drop ball
  const dropBall = () => {
    if (isPlaying) return;
    setIsPlaying(true);

    const { World, Bodies, Events } = Matter;
    const engine = engineRef.current;
    const world = engine.world;

    const ball = Bodies.circle(250, 20, 8, {
      restitution: 0.5,
      friction: 0.002,
      render: { fillStyle: "#a855f7" },
    });

    World.add(world, ball);

    // listen for position
    const checkPosition = setInterval(() => {
      if (ball.position.y > 580) {
        const slotWidth = 500 / multipliers[risk].length;
        const slotIndex = Math.floor(ball.position.x / slotWidth);
        const multi = multipliers[risk][slotIndex] || 0;

        setMultiplier(multi);
        setIsPlaying(false);
        World.remove(world, ball);
        clearInterval(checkPosition);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-6">
      {/* Left panel */}
      <div className="w-full md:w-72 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-wide text-center">
          🎯 Plinko Game
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300">Bet Amount</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="p-2 bg-[#0f172a] rounded-lg border border-gray-700 text-white outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300">Rows: {rows}</label>
          <input
            type="range"
            min="8"
            max="16"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="accent-purple-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300">Risk Level</label>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="p-2 bg-[#0f172a] rounded-lg border border-gray-700 text-white outline-none focus:border-purple-500"
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        <button
          onClick={dropBall}
          disabled={isPlaying}
          className={`mt-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
            isPlaying
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_10px_rgba(168,85,247,0.7)]"
          }`}
        >
          {isPlaying ? "Playing..." : "Drop Ball"}
        </button>

        {multiplier !== null && (
          <div className="text-center mt-4 text-lg font-semibold">
            <p>
              🎲 Result: <span className="text-purple-400">×{multiplier}</span>
            </p>
            <p className="text-gray-300">
              Winnings: {(bet * multiplier).toFixed(2)}₹
            </p>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={sceneRef}
        className="rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)]"
      />
    </div>
  );
};

export default PlinkoGame;
