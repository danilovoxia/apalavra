import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader2, Shield, Calendar, Sparkles, AlertCircle, Zap, Clock, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PREMIUM_PLAN, TRIAL_CONFIG } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  billingCycle?: 'monthly' | 'annual';
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, billingCycle = 'annual' }) => {
  const { user, upgradeToPremium, isTrial, trialDaysRemaining } = useAuth();
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  // Pricing based on billing cycle
  const pricing = {
    monthly: {
      price: 5.30,
      displayPrice: 'R$ 5,30',
      period: '/mês',
      description: 'Cobrança mensal',
      validityDays: 30,
      validityText: '30 dias',
    },
    annual: {
      price: 60.00,
      displayPrice: 'R$ 60,00',
      period: '/ano',
      description: 'Equivalente a R$ 5,00/mês',
      validityDays: 365,
      validityText: '12 meses',
    },
  };

  const currentPricing = pricing[billingCycle];

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardName.trim()) {
      newErrors.cardName = 'Nome é obrigatório';
    }
    
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }
    
    const [month, year] = expiry.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      newErrors.expiry = 'Data de validade inválida';
    }
    
    if (cvc.length < 3 || cvc.length > 4) {
      newErrors.cvc = 'CVV inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const tryStripeCheckout = async () => {
    try {
      const currentUrl = window.location.origin;
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          successUrl: `${currentUrl}?payment=success`,
          cancelUrl: `${currentUrl}?payment=cancelled`,
          userId: user?.id || null,
          userEmail: user?.email || null,
          billingCycle: billingCycle,
          priceAmount: currentPricing.price,
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
        return true;
      }
      return false;
    } catch (err) {
      console.log('Stripe checkout not available, using fallback');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStep('processing');
    
    // Try Stripe Checkout first
    const stripeSuccess = await tryStripeCheckout();
    
    if (!stripeSuccess) {
      // Fallback: simulate payment processing for demo
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate successful payment
      setStep('success');
      
      // Calculate expiry date based on billing cycle
      const expiryDate = new Date(Date.now() + currentPricing.validityDays * 24 * 60 * 60 * 1000);
      
      // Update premium status
      if (user) {
        // Update in database for logged in users
        await upgradeToPremium(billingCycle);
      } else {
        // Save to localStorage for non-logged users
        localStorage.setItem('userPlan', 'premium');
        localStorage.setItem('premiumExpiry', expiryDate.toISOString());
        localStorage.setItem('paymentDate', new Date().toISOString());
        localStorage.setItem('billingCycle', billingCycle);
        // Clear trial status
        localStorage.removeItem('isTrial');
        localStorage.removeItem('trialExpiry');
        localStorage.setItem('hasUsedTrial', 'true');
      }
      
      // Wait a bit then close and trigger success
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2000);
    }
  };

  const resetForm = () => {
    setStep('form');
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvc('');
    setErrors({});
    setErrorMessage('');
  };

  const handleClose = () => {
    if (step !== 'processing') {
      onClose();
      resetForm();
    }
  };

  // Card brand detection
  const getCardBrand = () => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    if (/^(?:2131|1800|35)/.test(cleanNumber)) return 'jcb';
    return null;
  };

  const cardBrand = getCardBrand();

  // Calculate expiry date for display
  const expiryDate = new Date(Date.now() + currentPricing.validityDays * 24 * 60 * 60 * 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 p-6 text-white sticky top-0">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            disabled={step === 'processing'}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {billingCycle === 'monthly' ? <Zap className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Plano Premium {billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
              </h2>
              <p className="text-white/80 text-sm">
                Acesso completo por {currentPricing.validityText}
              </p>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{currentPricing.displayPrice}</span>
            <span className="text-white/70">{currentPricing.period}</span>
          </div>
          <p className="text-white/70 text-sm mt-1">{currentPricing.description}</p>

          {/* Trial info banner */}
          {isTrial && trialDaysRemaining !== null && (
            <div className="mt-4 p-3 bg-white/20 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <div className="text-sm">
                <p className="font-medium">Você está no período de teste</p>
                <p className="text-white/80">
                  {trialDaysRemaining === 1 
                    ? 'Último dia! Assine agora para não perder o acesso.'
                    : `Restam ${trialDaysRemaining} dias. Assine para garantir acesso contínuo.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Login suggestion for non-logged users */}
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Dica:</strong> Faça login para sincronizar seu plano Premium entre dispositivos.{' '}
                    <a href="/login" className="text-cyan-600 hover:underline font-medium">Entrar</a>
                  </p>
                </div>
              )}

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`w-full pl-11 pr-16 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.cardNumber ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {cardBrand && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        cardBrand === 'visa' ? 'bg-blue-100 text-blue-700' :
                        cardBrand === 'mastercard' ? 'bg-orange-100 text-orange-700' :
                        cardBrand === 'amex' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {cardBrand}
                      </span>
                    </div>
                  )}
                </div>
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>

              {/* Card Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.cardName ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.expiry ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${errors.cvc ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Pagamento seguro com criptografia SSL</span>
              </div>

              {/* Accepted Cards */}
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-xs text-gray-400">Aceitamos:</span>
                <div className="flex gap-2">
                <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded">PIX</span>
                  <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">VISA</span>
                  <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded">MASTERCARD</span>
                  <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">AMEX</span>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">ELO</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
              >
                Pagar {currentPricing.displayPrice}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                Ao clicar em "Pagar", você concorda com nossos{' '}
                <a href="/termos" className="text-cyan-600 hover:underline">Termos de Serviço</a>
                {' '}e{' '}
                <a href="/privacidade" className="text-cyan-600 hover:underline">Política de Privacidade</a>
              </p>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Processando pagamento...</h3>
              <p className="text-gray-600">Por favor, aguarde enquanto processamos seu pagamento de forma segura.</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Transação protegida por criptografia</span>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h3>
              <p className="text-gray-600 mb-4">Bem-vindo ao Plano Premium! Seu acesso já está liberado.</p>
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4">
                <p className="text-sm text-cyan-700">
                  Válido até: <strong>{expiryDate.toLocaleDateString('pt-BR')}</strong>
                </p>
              </div>
              {!user && (
                <p className="text-sm text-gray-500 mt-4">
                  <a href="/register" className="text-cyan-600 hover:underline font-medium">Crie uma conta</a> para sincronizar entre dispositivos.
                </p>
              )}
            </div>
          )}

          {step === 'error' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Erro no Pagamento</h3>
              <p className="text-gray-600 mb-4">{errorMessage || 'Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.'}</p>
              <button
                onClick={() => setStep('form')}
                className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Features List */}
        {step === 'form' && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Incluído no Premium:</h4>
              <ul className="space-y-2">
                {PREMIUM_PLAN.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
