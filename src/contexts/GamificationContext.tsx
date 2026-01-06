import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useShareAnalytics, ShareEvent } from './ShareAnalyticsContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'total_shares' | 'streak' | 'channel' | 'special';
  channel?: string;
  unlockedAt?: string;
}

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  // Total shares badges
  {
    id: 'first_share',
    name: 'Primeiro Passo',
    description: 'Compartilhou seu primeiro versículo',
    icon: '🌱',
    requirement: 1,
    type: 'total_shares'
  },
  {
    id: 'shares_5',
    name: 'Semeador',
    description: 'Compartilhou 5 versículos',
    icon: '🌾',
    requirement: 5,
    type: 'total_shares'
  },
  {
    id: 'shares_10',
    name: 'Evangelista',
    description: 'Compartilhou 10 versículos',
    icon: '📖',
    requirement: 10,
    type: 'total_shares'
  },
  {
    id: 'shares_25',
    name: 'Mensageiro',
    description: 'Compartilhou 25 versículos',
    icon: '✉️',
    requirement: 25,
    type: 'total_shares'
  },
  {
    id: 'shares_50',
    name: 'Missionário',
    description: 'Compartilhou 50 versículos',
    icon: '🕊️',
    requirement: 50,
    type: 'total_shares'
  },
  {
    id: 'shares_100',
    name: 'Apóstolo Digital',
    description: 'Compartilhou 100 versículos',
    icon: '👑',
    requirement: 100,
    type: 'total_shares'
  },
  // Streak badges
  {
    id: 'streak_3',
    name: 'Consistente',
    description: 'Compartilhou por 3 dias seguidos',
    icon: '🔥',
    requirement: 3,
    type: 'streak'
  },
  {
    id: 'streak_7',
    name: 'Dedicado',
    description: 'Compartilhou por 7 dias seguidos',
    icon: '⭐',
    requirement: 7,
    type: 'streak'
  },
  {
    id: 'streak_14',
    name: 'Fiel',
    description: 'Compartilhou por 14 dias seguidos',
    icon: '💎',
    requirement: 14,
    type: 'streak'
  },
  {
    id: 'streak_30',
    name: 'Inabalável',
    description: 'Compartilhou por 30 dias seguidos',
    icon: '🏆',
    requirement: 30,
    type: 'streak'
  },
  // Channel badges
  {
    id: 'whatsapp_master',
    name: 'Mestre do WhatsApp',
    description: 'Compartilhou 20 vezes no WhatsApp',
    icon: '💬',
    requirement: 20,
    type: 'channel',
    channel: 'whatsapp'
  },
  // Special badges
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Compartilhou antes das 6h da manhã',
    icon: '🌅',
    requirement: 1,
    type: 'special'
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Compartilhou após as 23h',
    icon: '🦉',
    requirement: 1,
    type: 'special'
  }
];

export interface GamificationStats {
  totalShares: number;
  currentStreak: number;
  longestStreak: number;
  sharesByChannel: Record<string, number>;
  unlockedBadges: Badge[];
  lockedBadges: Omit<Badge, 'unlockedAt'>[];
  recentShares: ShareEvent[];
  impactScore: number;
  sharesByDay: Record<string, number>;
  lastShareDate: string | null;
}

interface GamificationContextType {
  stats: GamificationStats;
  checkAndUnlockBadges: () => Badge[];
  getProgress: (badgeId: string) => { current: number; required: number; percentage: number };
  isLoading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const GAMIFICATION_STORAGE_KEY = 'gamification_data';

interface StoredGamificationData {
  unlockedBadges: Badge[];
  longestStreak: number;
  lastCheckedShares: number;
}

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUserStats } = useShareAnalytics();
  const { user } = useAuth();
  const [storedData, setStoredData] = useState<StoredGamificationData>({
    unlockedBadges: [],
    longestStreak: 0,
    lastCheckedShares: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load stored data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      if (stored) {
        setStoredData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
    setIsLoading(false);
  }, []);

  // Save stored data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(storedData));
      } catch (error) {
        console.error('Error saving gamification data:', error);
      }
    }
  }, [storedData, isLoading]);

  // Calculate current streak from share events
  const calculateStreak = useCallback((recentShares: ShareEvent[]): number => {
    if (recentShares.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Get unique days with shares
    const shareDays = [...new Set(recentShares.map(s => s.created_at.split('T')[0]))].sort().reverse();
    
    if (shareDays.length === 0) return 0;
    
    // Check if the streak is still active (shared today or yesterday)
    const lastShareDay = shareDays[0];
    if (lastShareDay !== today && lastShareDay !== yesterday) {
      return 0; // Streak broken
    }

    let streak = 1;
    let currentDate = new Date(lastShareDay);
    
    for (let i = 1; i < shareDays.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      if (shareDays[i] === prevDateStr) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }, []);

  // Calculate stats
  const calculateStats = useCallback((): GamificationStats => {
    const userStats = getUserStats();
    const currentStreak = calculateStreak(userStats.recentShares);
    const longestStreak = Math.max(storedData.longestStreak, currentStreak);

    // Calculate shares by day
    const sharesByDay: Record<string, number> = {};
    userStats.recentShares.forEach(share => {
      const day = share.created_at.split('T')[0];
      sharesByDay[day] = (sharesByDay[day] || 0) + 1;
    });

    // Get last share date
    const lastShareDate = userStats.recentShares.length > 0 
      ? userStats.recentShares[0].created_at 
      : null;

    // Calculate impact score (simple formula: shares * 10 + streak bonus)
    const impactScore = userStats.totalShares * 10 + currentStreak * 5 + longestStreak * 2;

    // Get locked badges
    const unlockedIds = new Set(storedData.unlockedBadges.map(b => b.id));
    const lockedBadges = BADGE_DEFINITIONS.filter(b => !unlockedIds.has(b.id));

    return {
      totalShares: userStats.totalShares,
      currentStreak,
      longestStreak,
      sharesByChannel: userStats.sharesByChannel,
      unlockedBadges: storedData.unlockedBadges,
      lockedBadges,
      recentShares: userStats.recentShares,
      impactScore,
      sharesByDay,
      lastShareDate
    };
  }, [getUserStats, calculateStreak, storedData]);

  // Check and unlock new badges
  const checkAndUnlockBadges = useCallback((): Badge[] => {
    const stats = calculateStats();
    const newlyUnlocked: Badge[] = [];
    const unlockedIds = new Set(storedData.unlockedBadges.map(b => b.id));

    BADGE_DEFINITIONS.forEach(badgeDef => {
      if (unlockedIds.has(badgeDef.id)) return;

      let shouldUnlock = false;

      switch (badgeDef.type) {
        case 'total_shares':
          shouldUnlock = stats.totalShares >= badgeDef.requirement;
          break;
        case 'streak':
          shouldUnlock = stats.currentStreak >= badgeDef.requirement || 
                         stats.longestStreak >= badgeDef.requirement;
          break;
        case 'channel':
          if (badgeDef.channel) {
            shouldUnlock = (stats.sharesByChannel[badgeDef.channel] || 0) >= badgeDef.requirement;
          }
          break;
        case 'special':
          if (badgeDef.id === 'early_bird') {
            shouldUnlock = stats.recentShares.some(s => {
              const hour = new Date(s.created_at).getHours();
              return hour < 6;
            });
          } else if (badgeDef.id === 'night_owl') {
            shouldUnlock = stats.recentShares.some(s => {
              const hour = new Date(s.created_at).getHours();
              return hour >= 23;
            });
          }
          break;
      }

      if (shouldUnlock) {
        const unlockedBadge: Badge = {
          ...badgeDef,
          unlockedAt: new Date().toISOString()
        };
        newlyUnlocked.push(unlockedBadge);
      }
    });

    if (newlyUnlocked.length > 0) {
      setStoredData(prev => ({
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, ...newlyUnlocked],
        longestStreak: Math.max(prev.longestStreak, stats.currentStreak)
      }));

      // Show toast for each new badge
      newlyUnlocked.forEach(badge => {
        toast.success(`${badge.icon} Conquista Desbloqueada!`, {
          description: `${badge.name}: ${badge.description}`,
          duration: 5000
        });
      });
    }

    return newlyUnlocked;
  }, [calculateStats, storedData]);

  // Get progress for a specific badge
  const getProgress = useCallback((badgeId: string): { current: number; required: number; percentage: number } => {
    const stats = calculateStats();
    const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    
    if (!badge) {
      return { current: 0, required: 0, percentage: 0 };
    }

    let current = 0;
    const required = badge.requirement;

    switch (badge.type) {
      case 'total_shares':
        current = stats.totalShares;
        break;
      case 'streak':
        current = Math.max(stats.currentStreak, stats.longestStreak);
        break;
      case 'channel':
        if (badge.channel) {
          current = stats.sharesByChannel[badge.channel] || 0;
        }
        break;
      case 'special':
        // Special badges are either unlocked or not
        current = storedData.unlockedBadges.some(b => b.id === badgeId) ? 1 : 0;
        break;
    }

    const percentage = Math.min(100, Math.round((current / required) * 100));
    return { current, required, percentage };
  }, [calculateStats, storedData]);

  // Check for new badges whenever stats change
  useEffect(() => {
    if (!isLoading) {
      const userStats = getUserStats();
      if (userStats.totalShares > storedData.lastCheckedShares) {
        checkAndUnlockBadges();
        setStoredData(prev => ({
          ...prev,
          lastCheckedShares: userStats.totalShares
        }));
      }
    }
  }, [getUserStats, checkAndUnlockBadges, isLoading, storedData.lastCheckedShares]);

  const stats = calculateStats();

  return (
    <GamificationContext.Provider
      value={{
        stats,
        checkAndUnlockBadges,
        getProgress,
        isLoading
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};
