import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import NewMindMap from "./pages/NewMindMap";
import MindMapViewer from "./pages/MindMapViewer";
import { MindMapLibrary } from "@/components/MindMapLibrary";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <NewMindMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mindmap/:id"
            element={
              <ProtectedRoute>
                <MindMapViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <MindMapLibrary />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;