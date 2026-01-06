import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key - safe to use in frontend
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QOqHbGqKmZxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJx';

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Plan features (shared between monthly and annual)
const PREMIUM_FEATURES = [
  'Seleção de estado emocional',
  'Versículos ilimitados',
  'Diário de reflexões ilimitado',
  'Favoritos ilimitados',
  'Cards personalizados',
  'Sem anúncios'
];

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 7,
  name: 'Período de Teste Grátis',
  description: 'Experimente todos os recursos Premium por 7 dias sem cobrança',
  features: PREMIUM_FEATURES
};

// Monthly plan configuration
export const PREMIUM_MONTHLY_PLAN = {
  name: 'Plano Premium Mensal',
  price: 530, // R$ 5,30 in centavos
  currency: 'brl',
  interval: 'month',
  description: 'Acesso completo por 1 mês: Seleção de estado emocional, Versículos ilimitados, Diário de reflexões, Favoritos ilimitados, Cards personalizados, Sem anúncios',
  features: PREMIUM_FEATURES
};

// Annual plan configuration
export const PREMIUM_ANNUAL_PLAN = {
  name: 'Plano Premium Anual',
  price: 6000, // R$ 60,00 in centavos
  currency: 'brl',
  interval: 'year',
  description: 'Acesso completo por 12 meses: Seleção de estado emocional, Versículos ilimitados, Diário de reflexões, Favoritos ilimitados, Cards personalizados, Sem anúncios',
  features: PREMIUM_FEATURES
};

// Default plan (for backward compatibility)
export const PREMIUM_PLAN = {
  ...PREMIUM_ANNUAL_PLAN,
  features: PREMIUM_FEATURES
};

// Helper function to get plan by billing cycle
export const getPlanByBillingCycle = (billingCycle: 'monthly' | 'annual') => {
  return billingCycle === 'monthly' ? PREMIUM_MONTHLY_PLAN : PREMIUM_ANNUAL_PLAN;
};

// Helper function to calculate trial expiry date
export const getTrialExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + TRIAL_CONFIG.durationDays);
  return expiryDate;
};
