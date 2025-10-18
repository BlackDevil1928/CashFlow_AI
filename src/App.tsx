import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect } from "react";
import { mlEngine } from "@/lib/ai/ml-engine";
import { GlobalClickSpark } from "@/components/GlobalClickSpark";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Wallets from "./pages/Wallets";
import Income from "./pages/Income";
import Bills from "./pages/Bills";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import BillScanner from "./pages/BillScanner";
import FinancialGuidance from "./pages/FinancialGuidance";
import ExpandableTabsDemo from "./pages/ExpandableTabsDemo";
import NotFound from "./pages/NotFound";

// Optimized QueryClient configuration with caching and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Refetch on mount only if data is stale
      refetchOnMount: 'if-stale',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

const App = () => {
  // Initialize ML engine on app startup
  useEffect(() => {
    console.log('🤖 Initializing CashFlow AI...');
    mlEngine.initialize().then(() => {
      console.log('✅ AI Engine initialized successfully');
    }).catch((err) => {
      console.log('ℹ️  AI Engine will train when sufficient data is available');
    });
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalClickSpark sparkColor="#a855f7" sparkCount={12} sparkRadius={25} duration={500} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/income" element={<Income />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/bill-scanner" element={<BillScanner />} />
            <Route path="/financial-guidance" element={<FinancialGuidance />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/expandable-tabs-demo" element={<ExpandableTabsDemo />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
