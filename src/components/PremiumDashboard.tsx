import React from 'react';
import {
  Crown,
  Heart,
  BookOpen,
  Sparkles,
  Calendar,
  Star,
  Compass,
  Share2,
  Flame,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useReflections } from '@/contexts/ReflectionsContext';
import { useGamification } from '@/contexts/GamificationContext';
import DailyVerse from './DailyVerse';
import SyncStatusBar from './SyncStatusBar';
import ShareCounter from './gamification/ShareCounter';

interface PremiumDashboardProps {
  onNavigate: (section: string) => void;
  onSelectMood: () => void;
}

const HERO_BG_URL =
  'https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1764700809847_25037022.png';

// Emotion data with emojis (same as MoodSelectorScreen)
const emotions = [
  { id: 'paz', label: 'Paz', emoji: '🕊️', color: 'from-sky-400 to-blue-500' },
  { id: 'ansiedade', label: 'Ansiedade', emoji: '😰', color: 'from-slate-400 to-gray-500' },
  { id: 'gratidao', label: 'Gratidão', emoji: '🙏', color: 'from-amber-400 to-orange-500' },
  { id: 'tristeza', label: 'Tristeza', emoji: '😢', color: 'from-indigo-400 to-purple-500' },
  { id: 'esperanca', label: 'Esperança', emoji: '🌅', color: 'from-yellow-400 to-amber-500' },
  { id: 'amor', label: 'Amor', emoji: '❤️', color: 'from-rose-400 to-pink-500' },
  { id: 'medo', label: 'Medo', emoji: '😨', color: 'from-violet-400 to-purple-600' },
  { id: 'alegria', label: 'Alegria', emoji: '😊', color: 'from-green-400 to-emerald-500' },
  { id: 'forca', label: 'Força', emoji: '💪', color: 'from-orange-400 to-red-500' },
  { id: 'proposito', label: 'Propósito', emoji: '🎯', color: 'from-cyan-400 to-teal-500' },
];

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ onNavigate, onSelectMood }) => {
  const { profile, user, isTrial, trialDaysRemaining } = useAuth();
  const { favorites } = useFavorites();
  const {
    reflections,
    syncStatus: reflectionsSyncStatus,
    lastSyncedAt: reflectionsLastSynced,
    pendingCount: reflectionsPendingCount,
    syncReflections,
  } = useReflections();

  // Safely try to use gamification context
  let gamificationStats = { totalShares: 0, currentStreak: 0, unlockedBadges: [] as any[] };
  try {
    const gamification = useGamification();
    gamificationStats = gamification.stats;
  } catch (e) {
    // Gamification context not available
  }

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'Usuário';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const quickActions = [
    {
      icon: Sparkles,
      title: 'Receber uma Palavra',
      description: 'Para este momento',
      color: 'from-cyan-500 to-teal-500',
      onClick: onSelectMood,
    },
    {
      icon: Heart,
      title: 'Palavras guardadas',
      description: `${favorites.length} salvos`,
      color: 'from-rose-500 to-pink-500',
      onClick: () => onNavigate('favorites'),
    },
    {
      icon: BookOpen,
      title: 'Diário',
      description: `${reflections.length} reflexões`,
      color: 'from-purple-500 to-indigo-500',
      onClick: () => onNavigate('journal'),
    },
    {
      icon: Share2,
      title: 'Meu Impacto',
      description: `${gamificationStats.totalShares} compartilhamentos`,
      color: 'from-cyan-500 to-blue-500',
      onClick: () => onNavigate('shares'),
    },
  ];

  const handleEmotionClick = (emotionId: string) => {
    localStorage.setItem('selectedEmotion', emotionId);
    onSelectMood();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-amber-50/20">
      {/* HERO Premium alinhado ao Free */}
      <div className="relative overflow-hidden">
        {/* Background image */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src={HERO_BG_URL}
            alt=""
            className="
              absolute inset-0 h-full w-full object-cover
              object-[85%_25%]
              opacity-35
            "
          />
          {/* Overlay: legibilidade à esquerda, preserva rosto à direita */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0.04) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-200" />
              </div>

              {isTrial ? (
                <span className="px-3 py-1 bg-purple-500/25 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  Teste Premium • {trialDaysRemaining} dias
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/25 backdrop-blur-sm text-amber-50 text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Premium
                </span>
              )}

              {/* Gamification quick stats */}
              {gamificationStats.totalShares > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-cyan-500/25 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {gamificationStats.totalShares}
                  </span>
                  {gamificationStats.currentStreak > 0 && (
                    <span className="px-3 py-1 bg-orange-500/25 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {gamificationStats.currentStreak}d
                    </span>
                  )}
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {getGreeting()}, {getUserName()}!
            </h1>

            <p className="text-white/85 text-sm sm:text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>

            <p className="mt-3 text-white/85 text-sm sm:text-base max-w-xl">
              Comece pela sua emoção. A Palavra chega com propósito.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Sync Status Bar */}
        <div className="mb-6">
          <SyncStatusBar
            reflectionsSyncStatus={reflectionsSyncStatus}
            reflectionsLastSynced={reflectionsLastSynced}
            reflectionsPendingCount={reflectionsPendingCount}
            onSyncReflections={syncReflections}
          />
        </div>

        {/* Gamification Summary Card */}
        {gamificationStats.totalShares > 0 && (
          <div className="mb-6">
            <button
              onClick={() => onNavigate('shares')}
              className="w-full bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4 border border-cyan-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Seu Impacto</h3>
                    <p className="text-sm text-gray-600">
                      {gamificationStats.totalShares} compartilhamentos
                      {gamificationStats.currentStreak > 0 && (
                        <span className="ml-2 text-orange-600">
                          • {gamificationStats.currentStreak} dias seguidos
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {gamificationStats.unlockedBadges.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">
                        {gamificationStats.unlockedBadges.length}
                      </span>
                    </div>
                  )}
                  <span className="text-cyan-600 text-sm font-medium">Ver detalhes →</span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* MOBILE FIRST: emoções primeiro */}
        <div className="flex flex-col gap-8">
          {/* Emoções (order: 1 no mobile / 2 no desktop) */}
          <section className="order-1 lg:order-2">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Como você está se sentindo?
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Selecione seu estado emocional para receber uma Palavra personalizada
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => handleEmotionClick(emotion.id)}
                  className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden hover:scale-[1.02]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${emotion.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  <div
                    className={`w-12 h-12 mx-auto bg-gradient-to-br ${emotion.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}
                  >
                    <span className="text-2xl">{emotion.emoji}</span>
                  </div>
                  <h3 className="font-medium text-gray-700 text-sm text-center">
                    {emotion.label}
                  </h3>
                </button>
              ))}
            </div>
          </section>

          {/* Caminhos / Acesso rápido (order: 2 no mobile / 1 no desktop) */}
          <section className="order-2 lg:order-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              Caminhos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Versículo do Dia */}
          <section className="order-3">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              Versículo do Dia
            </h2>
            <DailyVerse />
          </section>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
