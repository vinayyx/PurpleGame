import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Mine from "./Games/Mine";
import CrashGame from "./Games/CrashGame";
import Hero from "./Pages/Hero";
import SignupModal from "./Auth/SignupModal";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mine" element={<Mine />} />
        <Route path="/crash" element={<CrashGame />} />
        <Route path="/hero" element={<Hero />} />
      </Routes>

    </div>
  );
}

export default App;
