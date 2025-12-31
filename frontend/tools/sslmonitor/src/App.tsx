import React from "react";
import { Routes, Route } from "react-router-dom";
import SSLMonitorDashboard from "./components/SSLMonitorDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";
const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<SSLMonitorDashboard />} />
    <Route path="/maula-ai" element={<NeuralLinkInterface />} />
  </Routes>
);
export default App;
