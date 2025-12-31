import React from "react";
import { Routes, Route } from "react-router-dom";
import ThreatRadarTool from "./components/ThreatRadarTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ThreatRadarTool />} />
      <Route path="/*" element={<ThreatRadarTool />} />
    </Routes>
  );
}

export default App;
