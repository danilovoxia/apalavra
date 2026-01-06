import React, { useState } from 'react';
import { X, Sparkles, Heart, BookOpen, RefreshCw, Palette, Ban, Shield, Crown, Zap, Check, Gift, Clock } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { useAuth } from '@/contexts/AuthContext';
import { TRIAL_CONFIG } from '@/lib/stripe';

interface SoftPaywallProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const SoftPaywall: React.FC<SoftPaywallProps> = ({ onClose, onSubscribe }) => {
  const { hasUsedTrial, isTrial, trialDaysRemaining, startTrial } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const handleUpgradeClick = (billingCycle: 'monthly' | 'annual') => {
    setSelectedBillingCycle(billingCycle);
    setShowCheckout(true);
  };

  const handleStartTrial = async () => {
    if (hasUsedTrial || isTrial) return;
    
    setIsStartingTrial(true);
    const result = await startTrial();
    setIsStartingTrial(false);
    
    if (result.success) {
      onSubscribe();
      onClose();
    }
  };

  const handlePaymentSuccess = () => {
    onSubscribe();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-cyan-500 via-teal-500 to-amber-500 p-6 text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Desbloqueie a Experiência Completa</h2>
            <p className="text-white/90 text-sm">Quer continuar recebendo versos personalizados todos os dias?</p>
          </div>
          
          <div className="p-6">
            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-cyan-600" />
                </div>
                <p className="text-sm text-gray-700">Seleção de estado emocional</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-sm text-gray-700">Versículos ilimitados</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm text-gray-700">Diário de reflexões ilimitado</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-sm text-gray-700">Favoritos ilimitados</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4 text-pink-600" />
                </div>
                <p className="text-sm text-gray-700">Cards personalizados</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Ban className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Sem anúncios</p>
              </div>
            </div>

            {/* Free Trial Option - Show if user hasn't used trial */}
            {!hasUsedTrial && !isTrial && (
              <div className="mb-6">
                <button
                  onClick={handleStartTrial}
                  disabled={isStartingTrial}
                  className="w-full p-4 rounded-xl border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all relative group"
                >
                  <div className="absolute -top-2 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Recomendado
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-bold text-purple-800">Teste Grátis</p>
                      <p className="text-xs text-gray-500">{TRIAL_CONFIG.durationDays} dias sem cobrança</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-800">R$ 0<span className="text-sm font-normal text-gray-500">/7 dias</span></p>
                      <span className="text-xs text-purple-600 font-medium">Cancele quando quiser</span>
                    </div>
                  </div>
                  {isStartingTrial && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Após o período de teste, escolha um plano ou volte para o gratuito
                </p>
              </div>
            )}

            {/* Trial Active Info */}
            {isTrial && trialDaysRemaining !== null && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">Teste Ativo</p>
                    <p className="text-sm text-emerald-600">
                      {trialDaysRemaining === 1 
                        ? 'Último dia! Assine para não perder o acesso.'
                        : `Restam ${trialDaysRemaining} dias`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            {!hasUsedTrial && !isTrial && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">ou assine agora</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            )}
            
            {/* Pricing Options */}
            <div className="space-y-3 mb-6">
              {/* Annual Option - Recommended */}
              <button
                onClick={() => handleUpgradeClick('annual')}
                className="w-full p-4 rounded-xl border-2 border-teal-500 bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-all relative"
              >
                <div className="absolute -top-2 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  Melhor Valor
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-bold text-cyan-800">Anual</p>
                    <p className="text-xs text-gray-500">Cobrança única de R$ 49,00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-800">R$ 4,90<span className="text-sm font-normal text-gray-500">/mês</span></p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Economize 6%</span>
                  </div>
                </div>
              </button>

              {/* Monthly Option */}
              <button
                onClick={() => handleUpgradeClick('monthly')}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-300 bg-white hover:bg-cyan-50/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-bold text-gray-800">Mensal</p>
                    <p className="text-xs text-gray-500">Cobrança mensal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">R$ 4,90<span className="text-sm font-normal text-gray-500">/mês</span></p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Pagamento seguro via cartão de crédito</span>
            </div>
            
            <button onClick={onClose} className="w-full text-gray-500 py-3 text-sm hover:text-gray-700 transition-colors mt-2">
              Continuar com plano gratuito
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={handlePaymentSuccess}
        billingCycle={selectedBillingCycle}
      />
    </>
  );
};

export default SoftPaywall;
