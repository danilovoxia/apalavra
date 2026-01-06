import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { ReflectionsProvider } from '@/contexts/ReflectionsContext';
import { ShareAnalyticsProvider } from '@/contexts/ShareAnalyticsContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { user, loading, upgradeToPremium } = useAuth();

  // 1) Captura status de pagamento e guarda uma flag curta (sessionStorage)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      sessionStorage.setItem('paymentSuccess', 'true');

      toast.success('Pagamento confirmado! Bem-vindo ao Premium!', {
        description: 'Seu acesso Premium está ativo.',
        duration: 5000,
      });

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (paymentStatus === 'cancelled') {
      toast.info('Pagamento cancelado', {
        description: 'Você pode tentar novamente quando quiser.',
        duration: 3000,
      });

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 2) Quando auth terminar, aplica o efeito do pagamento (se houver)
  useEffect(() => {
    const hadPaymentSuccess = sessionStorage.getItem('paymentSuccess') === 'true';
    if (!hadPaymentSuccess) return;

    // Espera auth carregar para decidir com segurança
    if (loading) return;

    const apply = async () => {
      try {
        if (user) {
          await upgradeToPremium('annual');
        } else {
          // Usuário não logado: libera via localStorage como backup
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);

          localStorage.setItem('userPlan', 'premium');
          localStorage.setItem('premiumExpiry', expiresAt.toISOString());
        }
      } finally {
        sessionStorage.removeItem('paymentSuccess');
      }
    };

    apply();
  }, [loading, user, upgradeToPremium]);

  return (
    <AppProvider>
      <ReflectionsProvider>
        <ShareAnalyticsProvider>
          <GamificationProvider>
            <AppLayout />
          </GamificationProvider>
        </ShareAnalyticsProvider>
      </ReflectionsProvider>
    </AppProvider>
  );
};

export default Index;
