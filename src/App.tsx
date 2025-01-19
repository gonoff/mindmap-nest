import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import NewMindMap from "./pages/NewMindMap";
import MindMapViewer from "./pages/MindMapViewer";
import { MindMapLibrary } from "@/components/MindMapLibrary";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new" element={<NewMindMap />} />
          <Route path="/mindmap/:id" element={<MindMapViewer />} />
          <Route path="/library" element={<MindMapLibrary />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;