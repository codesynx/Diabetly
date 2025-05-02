import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Info from "./pages/Info";
import NotFound from "./pages/NotFound";
import ChooseMethod from "./pages/ChooseMethod";
import Scan from "./pages/Scan";
import History from "./pages/History";
import Chat from "./pages/Chat";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Account from "./pages/Account";
import PurchaseCredits from "./pages/PurchaseCredits";
import PaymentSuccess from "./pages/PaymentSuccess";
import Pricing from "./pages/Pricing";
import { AuthProvider, useAuth } from "./lib/auth-context";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Auth aware redirecting component
const IndexRedirect = () => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show nothing
  if (isLoading) {
    return null;
  }
  
  // Redirect based on auth status
  if (user) {
    return <Navigate to="/account" replace />;
  } else {
    return <Index />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexRedirect />} />
            <Route path="/index" element={<Index />} />
            
            {/* Public Routes */}
            <Route path="/info" element={<Info />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected Routes - Analysis */}
            <Route 
              path="/choose-method" 
              element={
                <ProtectedRoute>
                  <ChooseMethod />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scan" 
              element={
                <ProtectedRoute>
                  <Scan />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - User Data */}
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            
            {/* Authentication routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes - Account */}
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase-credits" 
              element={
                <ProtectedRoute>
                  <PurchaseCredits />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment-success" 
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
