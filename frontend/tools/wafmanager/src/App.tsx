import React from "react";
import { Routes, Route } from "react-router-dom";
import WAFManagerDashboard from "./components/WAFManagerDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<WAFManagerDashboard />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
};

export default App;
