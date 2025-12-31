import React from "react";
import { Routes, Route } from "react-router-dom";
import IncidentResponseDashboard from "./components/IncidentResponseDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IncidentResponseDashboard />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
};

export default App;
