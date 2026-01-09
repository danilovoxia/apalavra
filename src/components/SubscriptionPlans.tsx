import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Heart,
  BookOpen,
  RefreshCw,
  Ban,
  Palette,
  Crown,
  Shield,
  Zap,
  Clock,
  Gift,
  QrCode,
  History,
  Bell,
  Sprout,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { TRIAL_CONFIG } from '@/lib/stripe';
import { createMpPreference } from '@/lib/subscription';

interface SubscriptionPlansProps {
  currentPlan: string;
  onUpgrade: (plan: string) => void;
}

type BillingCycle = 'month' | 'year';
type PaidPlan = 'essencial' | 'caminhada' | 'semeador';

function getErrMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

async function goToMpCheckout(plan: PaidPlan, cycle: BillingCycle) {
  console.log('CLICK ->', plan, cycle);

  const { checkout_url } = await createMpPreference(plan, cycle);

  console.log('MP URL ->', checkout_url);
  if (!checkout_url) throw new Error('checkout_url vazio');

  window.location.href = checkout_url;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentPlan, onUpgrade }) => {
  const { isTrial, trialDaysRemaining, hasUsedTrial, startTrial } = useAuth();
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [loading, setLoading] = useState<null | string>(null);

  // ✅ Agora “pago” = qualquer plano que não seja free/trial
  const isPaid = ['essencial', 'caminhada', 'semeador'].includes(currentPlan);

  const handleStartTrial = async () => {
    if (hasUsedTrial || isTrial) return;

    setIsStartingTrial(true);
    const result = await startTrial();
    setIsStartingTrial(false);

    if (result.success) {
      onUpgrade('trial');
    }
  };

  const essentialFeatures = [
    { icon: Heart, text: 'Versículos por emoção' },
    { icon: BookOpen, text: 'Reflexões diárias' },
    { icon: Sparkles, text: 'Compartilhamento' },
  ];

  const compromissoFeatures = [
    { icon: Check, text: 'Tudo do Essencial' },
    { icon: History, text: 'Histórico pessoal' },
    { icon: Sparkles, text: 'Trilhas (paz, ansiedade, gratidão…)' },
    { icon: Bell, text: 'Lembretes diários' },
    { icon: Shield, text: 'Acesso contínuo' },
  ];

  const propositoFeatures = [
    { icon: Check, text: 'Tudo do Compromisso' },
    { icon: Heart, text: '10% destinado a uma igreja/instituição' },
    { icon: BookOpen, text: 'Relatório de impacto' },
    { icon: Crown, text: 'Você ajudou a espalhar a Palavra' },
  ];

  return (
    <div className="py-10 w-full">
      {/* Header */}
      <div className="text-center mb-10 px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-cyan-800 mb-3">Escolha seu Plano</h2>
        <p className="text-cyan-700/70 max-w-xl mx-auto">
          Aprofunde sua jornada espiritual com acesso ilimitado a conteúdos personalizados.
        </p>
      </div>

      {/* Trial Banner */}
      {!hasUsedTrial && !isTrial && !isPaid && (
        <div className="max-w-6xl mx-auto mb-8 px-4">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Experimente Grátis por {TRIAL_CONFIG.durationDays} Dias!
                  </h3>
                  <p className="text-white/90 text-sm">
                    Todos os recursos pagos sem cobrança inicial. Cancele quando quiser.
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartTrial}
                disabled={isStartingTrial}
                className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isStartingTrial ? 'Ativando...' : 'Começar Teste Grátis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trial Active Banner */}
      {isTrial && trialDaysRemaining !== null && (
        <div className="max-w-6xl mx-auto mb-8 px-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Período de Teste Ativo</h3>
                  <p className="text-white/90 text-sm">
                    {trialDaysRemaining === 1
                      ? 'Último dia do seu teste! Assine agora para não perder o acesso.'
                      : `Restam ${trialDaysRemaining} dias. Assine para continuar com acesso ilimitado.`}
                  </p>
                </div>
              </div>
              <span className="bg-white/20 px-4 py-2 rounded-lg font-bold">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Grid responsivo + largura segura */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-cyan-800">Gratuito</h3>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-cyan-900">R$ 0</span>
              <span className="text-gray-500">/mês</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Versículos do Dia</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Compartilhar versículos</span>
              </li>
            </ul>

            <button
              disabled={currentPlan === 'free' && !isTrial}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                currentPlan === 'free' && !isTrial
                  ? 'bg-cyan-50 text-cyan-400 cursor-not-allowed'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
              }`}
            >
              {currentPlan === 'free' && !isTrial ? 'Plano Atual' : 'Selecionar'}
            </button>
          </div>

          {/* Essencial */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-cyan-200 hover:shadow-xl transition-all hover:border-cyan-400">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-cyan-800">Essencial A Palavra</h3>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500">R$ 4,90/mês</div>
              <div className="text-sm text-gray-500">ou R$ 49/ano</div>
            </div>

            <ul className="space-y-3 mb-8">
              {essentialFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <f.icon className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!!loading || isPaid}
                onClick={async () => {
                  try {
                    setLoading("essencial-month");
                    await goToMpCheckout('essencial', 'month');
                  } catch (e) {
                    console.error(e);
                    alert(`Não foi possível iniciar o pagamento.\n\n${getErrMessage(e)}`);
                  } finally {
                    setLoading(null);
                  }
                }}
                
                className={`py-3 rounded-xl font-bold transition-all ${
                  isPaid ? 'bg-cyan-50 text-cyan-400 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                {loading === 'essencial-month' ? 'Abrindo…' : 'Mensal'}
              </button>

              <button
                disabled={!!loading || isPaid}
                onClick={async () => {
                  try {
                    setLoading('essencial-year');
                    await goToMpCheckout('essencial', 'year');
                  } catch (e) {
                    console.error(e);
                    alert(`Não foi possível iniciar o pagamento.\n\n${getErrMessage(e)}`);
                  } finally {
                    setLoading(null);
                  }
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  isPaid ? 'bg-cyan-50 text-cyan-400 cursor-not-allowed' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                }`}
              >
                {loading === 'essencial-year' ? 'Abrindo…' : 'Anual'}
              </button>
            </div>
          </div>

          {/* Compromisso */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200 hover:shadow-xl transition-all hover:border-purple-400">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Compromisso Caminhada</h3>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500">R$ 9,90/mês</div>
              <div className="text-sm text-gray-500">ou R$ 99/ano</div>
            </div>

            <ul className="space-y-3 mb-8">
              {compromissoFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <f.icon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!!loading || isPaid}
                onClick={async () => {
                  try {
                    setLoading('caminhada-month');
                    await goToMpCheckout('caminhada', 'month');
                  } catch (e) {
                    console.error(e);
                    alert(`Não foi possível iniciar o pagamento.\n\n${getErrMessage(e)}`);
                  } finally {
                    setLoading(null);
                  }
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  isPaid ? 'bg-purple-50 text-purple-300 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {loading === 'caminhada-month' ? 'Abrindo…' : 'Mensal'}
              </button>

              <button
                disabled={!!loading || isPaid}
                onClick={async () => {
                  try {
                    setLoading('caminhada-year');
                    await goToMpCheckout('caminhada', 'year');
                  } catch (e) {
                    console.error(e);
                    alert(`Não foi possível iniciar o pagamento.\n\n${getErrMessage(e)}`);
                  } finally {
                    setLoading(null);
                  }
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  isPaid ? 'bg-purple-50 text-purple-300 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {loading === 'caminhada-year' ? 'Abrindo…' : 'Anual'}
              </button>
            </div>
          </div>

          {/* Propósito */}
          <div className="bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Propósito Semeador</h3>
            </div>

            <div className="mb-6">
              <div className="text-sm text-white/80">R$ 19,90/mês</div>
              <div className="text-sm text-white/80">ou R$ 199/ano</div>
            </div>

            <ul className="space-y-3 mb-8">
              {propositoFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <f.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!!loading || isPaid}
                onClick={async () => {
                  try {
                    setLoading('semeador-month');
                    await goToMpCheckout('semeador', 'month');
                  } catch (e) {
                    console.error(e);
                    alert(`Não foi possível iniciar o pagamento.\n\n${getErrMessage(e)}`);
                  } finally {
                    setLoading(null);
                  }
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  isPaid ? 'bg-white/20 cursor-not-allowed' : 'bg-white text-indigo-600 hover:bg-white/90'
                }`}
              >
                {loading === 'semeador-month' ? 'Abrindo…' : 'Mensal'}
              </button>

              <button
                disabled={!!loading || isPaid}
                onClick={async () => {
                  try {
                    setLoading('semeador-year');
                    await goToMpCheckout('semeador', 'year');
                  } catch (e) {
                    console.error(e);
                    alert(`Não foi possível iniciar o pagamento.\n\n${getErrMessage(e)}`);
                  } finally {
                    setLoading(null);
                  }
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  isPaid ? 'bg-white/20 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {loading === 'semeador-year' ? 'Abrindo…' : 'Anual'}
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 pb-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm">Pagamento Seguro</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <QrCode className="w-5 h-5 text-emerald-500" />
            <span className="text-sm">Aceitamos Pix</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Cancele quando quiser</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <Gift className="w-5 h-5 text-purple-500" />
            <span className="text-sm">{TRIAL_CONFIG.durationDays} dias grátis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
