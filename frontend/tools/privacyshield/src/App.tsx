import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivacyShieldDashboard from "./components/PrivacyShieldDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivacyShieldDashboard />} />
        <Route path="/maula-ai" element={<NeuralLinkInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
