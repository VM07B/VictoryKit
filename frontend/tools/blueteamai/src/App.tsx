import React from "react";
import { Routes, Route } from "react-router-dom";
import BlueTeamAIDashboard from "./components/BlueTeamAIDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";
const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<BlueTeamAIDashboard />} />
    <Route path="/maula-ai" element={<NeuralLinkInterface />} />
  </Routes>
);
export default App;
