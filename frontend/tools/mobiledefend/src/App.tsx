import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MobileDefendDashboard from "./components/MobileDefendDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MobileDefendDashboard />} />
        <Route path="/maula-ai" element={<NeuralLinkInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
