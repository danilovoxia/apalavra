import React from 'react';
import { Share2, Flame, Trophy } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

interface ShareCounterProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

const ShareCounter: React.FC<ShareCounterProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { stats, isLoading } = useGamification();

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-full h-8 w-20 ${className}`} />
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-full border border-cyan-100">
          <Share2 className="w-3.5 h-3.5 text-cyan-600" />
          <span className="text-sm font-semibold text-cyan-700">{stats.totalShares}</span>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full border border-orange-100">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-600">{stats.currentStreak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 ${className}`}>
      <div className="grid grid-cols-3 gap-4">
        {/* Total Shares */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center">
            <Share2 className="w-6 h-6 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalShares}</p>
          <p className="text-xs text-gray-500">Compartilhamentos</p>
        </div>

        {/* Current Streak */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.currentStreak}</p>
          <p className="text-xs text-gray-500">Dias seguidos</p>
        </div>

        {/* Badges */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.unlockedBadges.length}</p>
          <p className="text-xs text-gray-500">Conquistas</p>
        </div>
      </div>

      {/* Impact Score */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pontuação de Impacto</span>
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            {stats.impactScore} pts
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShareCounter;
