import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DRPlanDashboard from "./components/DRPlanDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DRPlanDashboard />} />
        <Route path="/maula-ai" element={<NeuralLinkInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
