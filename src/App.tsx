import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { OfflineProvider } from "@/contexts/OfflineContext";
import { ShareAnalyticsProvider } from "@/contexts/ShareAnalyticsContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import OfflineBanner from "@/components/OfflineBanner";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ContactPage from "./pages/ContactPage";
import SobrePage from "./pages/SobrePage";
import TermosPage from "./pages/TermosPage";
import PrivacidadePage from "./pages/PrivacidadePage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "@/pages/payment/PaymentSuccess";
import PaymentFailure from "@/pages/payment/PaymentFailure";
import PaymentPending from "@/pages/payment/PaymentPending";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OfflineProvider>
              <FavoritesProvider>
                <ShareAnalyticsProvider>
                  <GamificationProvider>
                    <OfflineBanner />
                    <div className="pt-0 transition-all duration-300">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/contato" element={<ContactPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/sobre" element={<SobrePage />} />
                        <Route path="/about" element={<SobrePage />} />
                        <Route path="/termos" element={<TermosPage />} />
                        <Route path="/terms" element={<TermosPage />} />
                        <Route path="/privacidade" element={<PrivacidadePage />} />
                        <Route path="/privacy" element={<PrivacidadePage />} />
                        <Route path="/admin/analytics" element={<AdminDashboard />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="/payment/success" element={<PaymentSuccess />} />
                        <Route path="/payment/failure" element={<PaymentFailure />} />
                        <Route path="/payment/pending" element={<PaymentPending />} />
                      </Routes>
                    </div>
                  </GamificationProvider>
                </ShareAnalyticsProvider>
              </FavoritesProvider>
            </OfflineProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
