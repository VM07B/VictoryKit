import React from "react";
import { Routes, Route } from "react-router-dom";
import PhishGuardTool from "./components/PhishGuardTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PhishGuardTool />} />
      <Route path="/*" element={<PhishGuardTool />} />
    </Routes>
  );
}

export default App;
