import React from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOffline } from '@/contexts/OfflineContext';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncIndicatorProps {
  status: SyncStatus;
  lastSyncedAt?: Date | null;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  showPendingCount?: boolean;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status,
  lastSyncedAt,
  errorMessage,
  onRetry,
  className,
  showPendingCount = false,
}) => {
  let pendingCount = 0;
  let isOnline = true;
  
  // Try to get offline context values, but don't fail if not available
  try {
    const offlineContext = useOffline();
    pendingCount = offlineContext.pendingCount;
    isOnline = offlineContext.isOnline;
  } catch (e) {
    // Context not available, use defaults
  }

  // Override status if offline
  const effectiveStatus = !isOnline ? 'offline' : status;

  const getStatusConfig = () => {
    switch (effectiveStatus) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: 'Sincronizando...',
          animate: true,
        };
      case 'synced':
        return {
          icon: Check,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Sincronizado',
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Erro na sincronização',
          animate: false,
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          label: 'Modo offline',
          animate: false,
        };
      default:
        return {
          icon: Cloud,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          label: 'Aguardando',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastSync = () => {
    if (!lastSyncedAt) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSyncedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours}h`;
    return lastSyncedAt.toLocaleDateString('pt-BR');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={effectiveStatus === 'error' ? onRetry : undefined}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all',
              config.bgColor,
              config.color,
              effectiveStatus === 'error' && onRetry && 'cursor-pointer hover:opacity-80',
              className
            )}
          >
            <Icon 
              className={cn(
                'w-3.5 h-3.5',
                config.animate && 'animate-spin'
              )} 
            />
            <span className="hidden sm:inline">{config.label}</span>
            {showPendingCount && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            {lastSyncedAt && effectiveStatus === 'synced' && (
              <p className="text-xs text-muted-foreground">
                Última sincronização: {formatLastSync()}
              </p>
            )}
            {effectiveStatus === 'error' && errorMessage && (
              <p className="text-xs text-red-400">{errorMessage}</p>
            )}
            {effectiveStatus === 'error' && onRetry && (
              <p className="text-xs text-muted-foreground">
                Clique para tentar novamente
              </p>
            )}
            {effectiveStatus === 'offline' && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Suas alterações serão sincronizadas quando você estiver online
                </p>
                {pendingCount > 0 && (
                  <p className="text-xs text-amber-500 font-medium">
                    {pendingCount} {pendingCount === 1 ? 'ação pendente' : 'ações pendentes'}
                  </p>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncIndicator;
