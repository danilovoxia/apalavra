import React from 'react';
import { Badge } from '@/contexts/GamificationContext';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: Badge | Omit<Badge, 'unlockedAt'>;
  isUnlocked: boolean;
  progress?: { current: number; required: number; percentage: number };
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isUnlocked,
  progress,
  size = 'md',
  showProgress = true
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-2',
      icon: 'text-2xl w-10 h-10',
      title: 'text-xs',
      description: 'text-[10px]'
    },
    md: {
      container: 'p-3',
      icon: 'text-3xl w-14 h-14',
      title: 'text-sm',
      description: 'text-xs'
    },
    lg: {
      container: 'p-4',
      icon: 'text-4xl w-16 h-16',
      title: 'text-base',
      description: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`
        relative rounded-xl border transition-all duration-300
        ${classes.container}
        ${isUnlocked 
          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-md' 
          : 'bg-gray-50 border-gray-200 opacity-60'
        }
      `}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`
            ${classes.icon} flex items-center justify-center rounded-full mb-2
            ${isUnlocked 
              ? 'bg-gradient-to-br from-amber-100 to-yellow-100' 
              : 'bg-gray-100'
            }
          `}
        >
          {isUnlocked ? (
            <span>{badge.icon}</span>
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Badge Name */}
        <h4 className={`font-semibold ${classes.title} ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
          {badge.name}
        </h4>

        {/* Badge Description */}
        <p className={`${classes.description} ${isUnlocked ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>
          {badge.description}
        </p>

        {/* Progress Bar (for locked badges) */}
        {!isUnlocked && showProgress && progress && progress.required > 0 && (
          <div className="w-full mt-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {progress.current}/{progress.required}
            </p>
          </div>
        )}

        {/* Unlocked Date */}
        {isUnlocked && 'unlockedAt' in badge && badge.unlockedAt && (
          <p className="text-[10px] text-amber-600 mt-1">
            {new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {/* Shine effect for unlocked badges */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
