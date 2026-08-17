import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Sparkles, Sun } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import Invoice from "./pages/Invoice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const NEON_MODE_KEY = "good-groomed-neon-mode";

const App = () => {
  const [neonMode, setNeonMode] = useState(() => localStorage.getItem(NEON_MODE_KEY) === "true");

  useEffect(() => {
    localStorage.setItem(NEON_MODE_KEY, String(neonMode));
  }, [neonMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={neonMode ? "neon-mode" : ""}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/invoice" element={<Invoice />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <button
            type="button"
            aria-pressed={neonMode}
            aria-label={neonMode ? "Turn off neon mode" : "Turn on neon mode"}
            onClick={() => setNeonMode((enabled) => !enabled)}
            className="neon-mode-toggle fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-extrabold shadow-lg transition"
          >
            {neonMode ? <Sun className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {neonMode ? "Day mode" : "Neon mode"}
          </button>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
