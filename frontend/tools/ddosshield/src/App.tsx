import React from "react";
import { Routes, Route } from "react-router-dom";
import DDoSShieldDashboard from "./components/DDoSShieldDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";
const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<DDoSShieldDashboard />} />
    <Route path="/maula-ai" element={<NeuralLinkInterface />} />
  </Routes>
);
export default App;
