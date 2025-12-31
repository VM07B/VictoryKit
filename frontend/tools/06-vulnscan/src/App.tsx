import React from "react";
import { Routes, Route } from "react-router-dom";
import VulnScanTool from "./components/VulnScanTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VulnScanTool />} />
      <Route path="/*" element={<VulnScanTool />} />
    </Routes>
  );
}

export default App;
