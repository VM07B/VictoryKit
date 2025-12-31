import React from "react";
import { Routes, Route } from "react-router-dom";
import SOAREngineDashboard from "./components/SOAREngineDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";
const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<SOAREngineDashboard />} />
    <Route path="/maula-ai" element={<NeuralLinkInterface />} />
  </Routes>
);
export default App;
