import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import AuthPage from "./pages/AuthPage";
import Inicio from "./pages/Inicio";
import Admin from "./pages/Admin";
import FutbolPage from "./pages/Futbol";
import { DeportePage } from "./pages/DeportePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/inicio" element={<Inicio />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/futbol/:sub" element={<FutbolPage />} />
                  <Route path="/voley" element={<DeportePage deporte="voley" />} />
                  <Route path="/patin" element={<DeportePage deporte="patin" />} />
                  <Route path="/basquet" element={<DeportePage deporte="basquet" />} />
                  <Route path="/padel" element={<DeportePage deporte="padel" />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
