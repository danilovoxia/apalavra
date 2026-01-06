import React, { useState } from 'react';
import { Share2, Flame, Trophy, TrendingUp, Calendar, Clock, ChevronRight, Award, Target } from 'lucide-react';
import { useGamification, BADGE_DEFINITIONS } from '@/contexts/GamificationContext';
import BadgeCard from './BadgeCard';
import ShareCounter from './ShareCounter';

interface UserSharesSectionProps {
  onClose?: () => void;
}

const UserSharesSection: React.FC<UserSharesSectionProps> = ({ onClose }) => {
  const { stats, getProgress, isLoading } = useGamification();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      copy: 'Copiado',
      native_share: 'Compartilhamento',
      download: 'Download'
    };
    return labels[channel] || channel;
  };

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-100 text-green-700',
      copy: 'bg-blue-100 text-blue-700',
      native_share: 'bg-purple-100 text-purple-700',
      download: 'bg-gray-100 text-gray-700'
    };
    return colors[channel] || 'bg-gray-100 text-gray-700';
  };

  // Get next badge to unlock
  const nextBadge = stats.lockedBadges[0];
  const nextBadgeProgress = nextBadge ? getProgress(nextBadge.id) : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Seus Compartilhamentos
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.totalShares}</p>
            <p className="text-sm text-cyan-100">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold flex items-center justify-center gap-1">
              {stats.currentStreak}
              {stats.currentStreak > 0 && <Flame className="w-5 h-5 text-orange-300" />}
            </p>
            <p className="text-sm text-cyan-100">Sequência</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.unlockedBadges.length}</p>
            <p className="text-sm text-cyan-100">Conquistas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'badges'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Conquistas
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Impact Score Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 border border-cyan-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Seu Impacto</h3>
                  <p className="text-sm text-gray-600">Você está espalhando a Palavra!</p>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  {stats.impactScore}
                </p>
                <p className="text-sm text-gray-500">pontos de impacto</p>
              </div>
              <p className="text-xs text-center text-gray-500">
                Cada compartilhamento pode alcançar dezenas de pessoas!
              </p>
            </div>

            {/* Next Badge Progress */}
            {nextBadge && nextBadgeProgress && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Próxima Conquista</h3>
                    <p className="text-sm text-gray-600">{nextBadge.name}</p>
                  </div>
                  <span className="text-2xl">{nextBadge.icon}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{nextBadge.description}</span>
                    <span className="font-medium text-amber-700">
                      {nextBadgeProgress.current}/{nextBadgeProgress.required}
                    </span>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${nextBadgeProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Streak Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Sequência Atual</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{stats.currentStreak} dias</p>
                {stats.currentStreak > 0 && (
                  <p className="text-xs text-orange-500 mt-1">Continue assim!</p>
                )}
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Maior Sequência</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.longestStreak} dias</p>
              </div>
            </div>

            {/* Channels Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Por Canal</h3>
              <div className="space-y-2">
                {Object.entries(stats.sharesByChannel).map(([channel, count]) => (
                  <div key={channel} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(channel)}`}>
                      {getChannelLabel(channel)}
                    </span>
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.sharesByChannel).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Nenhum compartilhamento ainda
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Unlocked Badges */}
            {stats.unlockedBadges.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Conquistas Desbloqueadas ({stats.unlockedBadges.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {stats.unlockedBadges.map(badge => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      isUnlocked={true}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Badges */}
            {stats.lockedBadges.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-500 mb-3">
                  A Desbloquear ({stats.lockedBadges.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {stats.lockedBadges.map(badge => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      isUnlocked={false}
                      progress={getProgress(badge.id)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {stats.unlockedBadges.length === 0 && stats.lockedBadges.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Compartilhe versículos para desbloquear conquistas!</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {stats.recentShares.length > 0 ? (
              stats.recentShares.slice(0, 20).map((share, index) => (
                <div
                  key={share.id || index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{share.verse_reference}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getChannelColor(share.channel)}`}>
                        {getChannelLabel(share.channel)}
                      </span>
                      {share.with_image && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                          Com imagem
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{formatDate(share.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum compartilhamento ainda</p>
                <p className="text-sm text-gray-400 mt-1">
                  Compartilhe um versículo para começar!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSharesSection;
