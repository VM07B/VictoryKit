import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IoTSecureDashboard from "./components/IoTSecureDashboard";
import NeuralLinkInterface from "./components/NeuralLinkInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IoTSecureDashboard />} />
        <Route path="/maula-ai" element={<NeuralLinkInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
