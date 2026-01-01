import React from "react";
import { Routes, Route } from "react-router-dom";
import FraudGuardTool from "./components/FraudGuardTool";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FraudGuardTool />} />
      <Route path="/maula-ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
