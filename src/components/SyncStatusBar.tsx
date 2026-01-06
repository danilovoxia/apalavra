import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  WifiOff,
  ChevronDown,
  ChevronUp,
  Heart,
  BookOpen,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SyncStatusBarProps {
  reflectionsSyncStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  reflectionsLastSynced?: Date | null;
  reflectionsPendingCount?: number;
  onSyncReflections?: () => Promise<void>;
  className?: string;
}

const SyncStatusBar: React.FC<SyncStatusBarProps> = ({
  reflectionsSyncStatus = 'idle',
  reflectionsLastSynced,
  reflectionsPendingCount = 0,
  onSyncReflections,
  className,
}) => {
  const { user } = useAuth();
  const { 
    syncStatus: favoritesSyncStatus, 
    lastSyncedAt: favoritesLastSynced,
    syncFavorites,
    favorites
  } = useFavorites();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Count local-only favorites
  const favoritesPendingCount = favorites.filter(f => f.localOnly).length;

  // Get overall status
  const getOverallStatus = () => {
    if (!isOnline) return 'offline';
    if (favoritesSyncStatus === 'syncing' || reflectionsSyncStatus === 'syncing' || isSyncing) return 'syncing';
    if (favoritesSyncStatus === 'error' || reflectionsSyncStatus === 'error') return 'error';
    if (favoritesSyncStatus === 'synced' && reflectionsSyncStatus === 'synced') return 'synced';
    if (favoritesPendingCount > 0 || reflectionsPendingCount > 0) return 'pending';
    return 'synced';
  };

  const overallStatus = getOverallStatus();
  const totalPending = favoritesPendingCount + reflectionsPendingCount;

  const handleSyncAll = async () => {
    if (!user || !isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Sync favorites
      await syncFavorites();
      
      // Sync reflections if handler provided
      if (onSyncReflections) {
        await onSyncReflections();
      }

      toast.success('Sincronização concluída!', {
        description: 'Todos os dados foram sincronizados com sucesso.'
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erro na sincronização', {
        description: 'Tente novamente em alguns instantes.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (date: Date | null | undefined) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          label: 'Sincronizando...',
          animate: true,
        };
      case 'synced':
        return {
          icon: Check,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          label: 'Sincronizado',
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          label: 'Erro na sincronização',
          animate: false,
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
          label: 'Modo offline',
          animate: false,
        };
      case 'pending':
        return {
          icon: Cloud,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
          label: `${totalPending} pendente${totalPending > 1 ? 's' : ''}`,
          animate: false,
        };
      default:
        return {
          icon: Cloud,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 border-gray-200',
          label: 'Aguardando',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Don't show if not logged in
  if (!user) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Compact Status Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
          config.bgColor,
          'hover:shadow-sm'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            overallStatus === 'synced' ? 'bg-green-100' : 
            overallStatus === 'error' ? 'bg-red-100' : 
            overallStatus === 'offline' ? 'bg-amber-100' : 'bg-blue-100'
          )}>
            <Icon className={cn(
              'w-4 h-4',
              config.color,
              config.animate && 'animate-spin'
            )} />
          </div>
          <div className="text-left">
            <p className={cn('text-sm font-medium', config.color)}>
              {config.label}
            </p>
            {overallStatus === 'synced' && favoritesLastSynced && (
              <p className="text-xs text-gray-500">
                Última sincronização: {formatLastSync(favoritesLastSynced)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalPending > 0 && overallStatus !== 'syncing' && (
            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
              {totalPending}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          {/* Favorites Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Favoritos</p>
                <p className="text-xs text-gray-500">
                  {favoritesPendingCount > 0 
                    ? `${favoritesPendingCount} pendente${favoritesPendingCount > 1 ? 's' : ''}` 
                    : 'Sincronizado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {favoritesSyncStatus === 'syncing' ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : favoritesSyncStatus === 'synced' && favoritesPendingCount === 0 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : favoritesSyncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CloudOff className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>

          {/* Reflections Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Reflexões</p>
                <p className="text-xs text-gray-500">
                  {reflectionsPendingCount > 0 
                    ? `${reflectionsPendingCount} pendente${reflectionsPendingCount > 1 ? 's' : ''}` 
                    : 'Sincronizado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {reflectionsSyncStatus === 'syncing' ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : reflectionsSyncStatus === 'synced' && reflectionsPendingCount === 0 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : reflectionsSyncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CloudOff className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>

          {/* Sync Button */}
          <Button
            onClick={handleSyncAll}
            disabled={!isOnline || isSyncing || overallStatus === 'syncing'}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
          >
            {isSyncing || overallStatus === 'syncing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Agora
              </>
            )}
          </Button>

          {!isOnline && (
            <p className="text-xs text-center text-amber-600">
              Você está offline. A sincronização será feita automaticamente quando a conexão for restabelecida.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncStatusBar;
