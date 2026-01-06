import React, { useState, useEffect } from 'react';
import { WifiOff, CloudOff, RefreshCw, Cloud, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getSyncQueue, SyncQueueItem } from '@/lib/syncQueue';

const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, syncError, processQueue, retryFailedItems, clearQueue } = useOffline();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  // Update queue details when expanded
  useEffect(() => {
    if (showDetails) {
      setQueue(getSyncQueue());
    }
  }, [showDetails, pendingCount]);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      setShowBanner(true);
    }
  }, [isOnline]);

  // Show banner with animation
  useEffect(() => {
    if (!isOnline || isSyncing || syncError || pendingCount > 0) {
      setShowBanner(true);
    } else {
      // Delay hiding to show success state briefly
      const timer = setTimeout(() => setShowBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing, syncError, pendingCount]);

  // Don't show anything if online with no pending items and no errors
  if (!showBanner) {
    return null;
  }

  // Don't show if dismissed (only for minor states)
  if (dismissed && isOnline && !syncError) {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
        textColor: 'text-white',
        title: 'Você está offline',
        description: pendingCount > 0 
          ? `${pendingCount} ${pendingCount === 1 ? 'ação pendente' : 'ações pendentes'} para sincronizar`
          : 'Suas alterações serão salvas localmente',
      };
    }

    if (isSyncing) {
      return {
        icon: RefreshCw,
        bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textColor: 'text-white',
        title: 'Sincronizando...',
        description: `Processando ${pendingCount} ${pendingCount === 1 ? 'item' : 'itens'}`,
        animate: true,
      };
    }

    if (syncError) {
      return {
        icon: AlertCircle,
        bgColor: 'bg-gradient-to-r from-red-500 to-rose-500',
        textColor: 'text-white',
        title: 'Erro na sincronização',
        description: syncError,
      };
    }

    if (pendingCount > 0) {
      return {
        icon: Cloud,
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        textColor: 'text-white',
        title: 'Sincronização pendente',
        description: `${pendingCount} ${pendingCount === 1 ? 'item aguardando' : 'itens aguardando'} sincronização`,
      };
    }

    return {
      icon: CheckCircle2,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      textColor: 'text-white',
      title: 'Tudo sincronizado',
      description: 'Seus dados estão atualizados',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'add_favorite': return 'Adicionar favorito';
      case 'remove_favorite': return 'Remover favorito';
      case 'add_reflection': return 'Nova reflexão';
      case 'update_reflection': return 'Atualizar reflexão';
      case 'delete_reflection': return 'Excluir reflexão';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pendente</span>;
      case 'processing':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Processando</span>;
      case 'failed':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">Falhou</span>;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'sticky top-0 left-0 right-0 z-[60] transition-all duration-300',
      config.bgColor,
      config.textColor
    )}>
      {/* Main Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              'p-1.5 sm:p-2 rounded-full bg-white/20',
              config.animate && 'animate-pulse'
            )}>
              <Icon className={cn(
                'w-4 h-4 sm:w-5 sm:h-5',
                config.animate && 'animate-spin'
              )} />
            </div>
            <div>
              <p className="font-semibold text-xs sm:text-sm">{config.title}</p>
              <p className="text-[10px] sm:text-xs opacity-90 hidden sm:block">{config.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {syncError && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => retryFailedItems()}
                className="text-white hover:bg-white/20 text-xs h-7 px-2"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Tentar novamente</span>
              </Button>
            )}

            {/* Details Toggle */}
            {pendingCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Dismiss Button */}
            {isOnline && !syncError && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && pendingCount > 0 && (
        <div className="bg-white text-gray-800 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Fila de Sincronização</h4>
              {queue.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar a fila? As ações pendentes serão perdidas.')) {
                      clearQueue();
                      setShowDetails(false);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  Limpar fila
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {queue.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-3">
                    <CloudOff className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">
                        {getActionTypeLabel(item.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.payload.verse_reference || item.payload.reference || 
                         (item.payload.content && item.payload.content.substring(0, 30) + '...') ||
                         'Item'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.retryCount > 0 && (
                      <span className="text-xs text-gray-400">
                        {item.retryCount}x
                      </span>
                    )}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}

              {queue.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">
                  Nenhum item na fila
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineBanner;
