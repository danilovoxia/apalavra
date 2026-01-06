import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MoodCard from './MoodCard';
import DailyVerse from './DailyVerse';
import SubscriptionPlans from './SubscriptionPlans';
import CheckoutModal from './CheckoutModal';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Crown, Sparkles } from 'lucide-react';

interface MoodSelectorScreenProps {
  onSelectMood: (mood: string) => void;
  currentPlan?: string;
  onUpgrade?: (plan: string) => void;
  isPremiumUser?: boolean;
}

const moods = [
  { id: 'paz', label: 'Paz', emoji: '🕊️' },
  { id: 'ansiedade', label: 'Ansiedade', emoji: '😰' },
  { id: 'gratidao', label: 'Gratidão', emoji: '🙏' },
  { id: 'tristeza', label: 'Tristeza', emoji: '😢' },
  { id: 'esperanca', label: 'Esperança', emoji: '🌅' },
  { id: 'amor', label: 'Amor', emoji: '❤️' },
  { id: 'medo', label: 'Medo', emoji: '😨' },
  { id: 'alegria', label: 'Alegria', emoji: '😊' },
  { id: 'forca', label: 'Força', emoji: '💪' },
  { id: 'proposito', label: 'Propósito', emoji: '🎯' },
];

const HERO_BG_URL =
  'https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1764700809847_25037022.png';

const MoodSelectorScreen: React.FC<MoodSelectorScreenProps> = ({
  onSelectMood,
  currentPlan = 'free',
  onUpgrade = () => {},
  isPremiumUser = false,
}) => {
  const { user, isPremium } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handlePremiumClick = () => {
    setSelectedBillingCycle('annual');
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    onUpgrade('premium');
    setShowCheckout(false);
  };

  // Layout simplificado para usuários Premium
  if (isPremiumUser || isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-amber-50/20">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span className="text-cyan-700 text-sm font-medium">Acesso Premium Ilimitado</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-cyan-800 mb-3">
              Como você está se sentindo?
            </h1>
            <p className="text-cyan-700/70 max-w-lg mx-auto">
              Selecione seu estado emocional e receba uma Palavra para este momento
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-10">
            {moods.map((mood) => (
              <MoodCard
                key={mood.id}
                id={mood.id}
                label={mood.label}
                emoji={mood.emoji}
                onClick={() => onSelectMood(mood.id)}
              />
            ))}
          </div>

          <div className="mb-8">
            <DailyVerse />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO (mobile-first): imagem controlada + overlay */}
      <div className="relative w-full overflow-hidden">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src={HERO_BG_URL}
            alt=""
            className="
              absolute inset-0 h-full w-full object-cover
              object-[85%_22%]
              opacity-25
            "
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 48%, rgba(255,255,255,0.35) 78%, rgba(255,255,255,0.10) 100%)',
            }}
          />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 px-4 pt-6 pb-7 sm:pt-8 sm:pb-10">
          <div className="max-w-7xl mx-auto">
            {/* Selo */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100/80 backdrop-blur-sm rounded-full">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span className="text-cyan-700 text-sm font-medium">
                  Versículos personalizados para você
                </span>
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-800 mb-2 leading-tight">
                Como você está se sentindo hoje?
              </h1>
              <p className="text-base sm:text-lg text-cyan-700/80 max-w-2xl mx-auto">
                Selecione seu estado emocional e receba uma Palavra para este momento
              </p>
            </div>

            {/* CTAs (mais discretos; não competem com a emoção) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              {!user && (
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/85 backdrop-blur-sm text-cyan-700 rounded-full hover:bg-white transition-all font-semibold shadow-sm border border-cyan-100"
                >
                  <LogIn className="w-5 h-5" />
                  Acessar
                </Link>
              )}

              {!isPremium && (
                <button
                  onClick={handlePremiumClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full hover:opacity-95 transition-all font-semibold shadow-md shadow-amber-500/20"
                >
                  <Crown className="w-5 h-5" />
                  Aprofundar minha jornada
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Emoções (foco principal) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6">
            {moods.map((mood) => (
              <MoodCard
                key={mood.id}
                id={mood.id}
                label={mood.label}
                emoji={mood.emoji}
                onClick={() => onSelectMood(mood.id)}
              />
            ))}
          </div>

          {/* Convite suave Free → Premium (sem “venda pesada”) */}
          {!isPremium && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 sm:p-5">
                <p className="text-gray-800 font-semibold text-center">
                  Deseja receber palavras personalizadas sempre que precisar?
                </p>
                <p className="text-gray-600 text-sm text-center mt-1">
                  Uma jornada mais profunda, com acesso completo ao app.
                </p>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handlePremiumClick}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold shadow-md shadow-amber-500/20 hover:opacity-95 transition-all"
                  >
                    <Crown className="w-5 h-5" />
                    Aprofundar minha jornada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Divisor */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
          </div>

          {/* Versículo do Dia */}
          <div className="mb-10">
            <DailyVerse />
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
          </div>

          {/* Planos (continua existindo para quem quiser detalhes) */}
          <div className="max-w-4xl mx-auto">
            <SubscriptionPlans currentPlan={currentPlan} onUpgrade={onUpgrade} />
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
    </div>
  );
};

export default MoodSelectorScreen;
