import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import Documents from "./pages/Documents";
import Important from "./pages/Important";
import Archive from "./pages/Archive";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/important" element={<Important />} />
        <Route path="/archive" element={<Archive />} />
      </Routes>
    </Router>
  );
};

export default App;
