import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import CrashGame from "./Games/CrashGame";
import Hero from "./Pages/Hero";
import SignupModal from "./Auth/SignupModal";
import MinePage from "./Pages/MinePage";
import PlinkoGame from "./Games/PlinkoGame";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mine" element={<MinePage />} />
        <Route path="/crash" element={<CrashGame />} />
        <Route path="/hero" element={<Hero />} />
        <Route path="/pliko" element={<PlinkoGame />} />
      </Routes>
    </div>
  );
}

export default App;
