import React from "react";
import { Routes, Route } from "react-router-dom";
import APIGuardDashboard from "./components/APIGuardDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<APIGuardDashboard />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
};

export default App;
