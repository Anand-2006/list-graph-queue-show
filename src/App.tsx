import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LinkedList from "./pages/LinkedList";
import Queue from "./pages/Queue";
import Graph from "./pages/Graph";
import Algorithms from "./pages/Algorithms";
import FloydsCycle from "./pages/FloydsCycle";
import CircularQueue from "./pages/CircularQueue";
import Deque from "./pages/Deque";
import Prims from "./pages/Prims";
import Kruskals from "./pages/Kruskals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/linked-list" element={<LinkedList />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/algorithms" element={<Algorithms />} />
          <Route path="/algorithms/floyds-cycle" element={<FloydsCycle />} />
          <Route path="/algorithms/circular-queue" element={<CircularQueue />} />
          <Route path="/algorithms/deque" element={<Deque />} />
          <Route path="/algorithms/prims" element={<Prims />} />
          <Route path="/algorithms/kruskals" element={<Kruskals />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
