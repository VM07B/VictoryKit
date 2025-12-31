import React from "react";
import { Routes, Route } from "react-router-dom";
import EnhancedIntelliScoutTool from "./components/EnhancedIntelliScoutTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EnhancedIntelliScoutTool />} />
      <Route path="/*" element={<EnhancedIntelliScoutTool />} />
    </Routes>
  );
}

export default App;
