import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import SuccessPage from "./components/SuccessPage";
import ErrorPage from "./components/ErrorPage";
import PendingPage from "./components/PendingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/pending" element={<PendingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
