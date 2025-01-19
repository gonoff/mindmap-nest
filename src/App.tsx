import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewMindMap from "./pages/NewMindMap";
import MindMapViewer from "./pages/MindMapViewer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/new" element={<NewMindMap />} />
        <Route path="/mindmap/:id" element={<MindMapViewer />} />
      </Routes>
    </Router>
  );
}

export default App;