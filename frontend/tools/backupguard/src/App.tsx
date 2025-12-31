import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BackupGuardDashboard from "./components/BackupGuardDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BackupGuardDashboard />} />
        <Route path="/maula-ai" element={<NeuralLinkInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
