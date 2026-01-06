import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  getSyncQueue, 
  addToSyncQueue, 
  removeFromSyncQueue, 
  updateQueueItemStatus,
  getPendingCount,
  clearSyncQueue,
  SyncQueueItem,
  SyncActionType 
} from '@/lib/syncQueue';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface OfflineContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAttempt: Date | null;
  syncError: string | null;
  queueAction: (type: SyncActionType, payload: any) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
  retryFailedItems: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const wasOfflineRef = useRef(false);

  // Update pending count
  const updatePendingCount = useCallback(() => {
    setPendingCount(getPendingCount());
  }, []);

  // Handle online status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(null);
      
      // Only show toast and sync if we were previously offline
      if (wasOfflineRef.current) {
        toast.success('Conexão restaurada!', {
          description: 'Sincronizando dados pendentes...',
          duration: 3000,
        });
        
        // Auto-sync when coming back online
        if (user && !processingRef.current) {
          setTimeout(() => {
            processQueue();
          }, 1000);
        }
      }
      wasOfflineRef.current = false;
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
      toast.warning('Você está offline', {
        description: 'Suas ações serão salvas e sincronizadas quando a conexão for restaurada.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setIsOnline(false);
      wasOfflineRef.current = true;
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Update pending count on mount and when queue changes
  useEffect(() => {
    updatePendingCount();
    
    // Check for pending items periodically
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // Queue an action for later sync
  const queueAction = useCallback((type: SyncActionType, payload: any) => {
    addToSyncQueue(type, payload);
    updatePendingCount();
  }, [updatePendingCount]);

  // Process a single queue item
  const processQueueItem = async (item: SyncQueueItem): Promise<boolean> => {
    if (!user) return false;

    updateQueueItemStatus(item.id, 'processing');

    try {
      switch (item.type) {
        case 'add_favorite': {
          const { error } = await supabase
            .from('favorite_verses')
            .upsert({
              user_id: user.id,
              verse_id: item.payload.verse_id || item.payload.id,
              verse_text: item.payload.verse_text || item.payload.text,
              verse_reference: item.payload.verse_reference || item.payload.reference,
              verse_emotion: item.payload.verse_emotion || item.payload.emotion,
              created_at: item.payload.created_at || item.timestamp,
            }, {
              onConflict: 'user_id,verse_id'
            });

          if (error) {
            // Handle missing table gracefully
            if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
              console.log('favorite_verses table not found, skipping sync');
              return true; // Consider it successful to remove from queue
            }
            throw error;
          }
          return true;
        }

        case 'remove_favorite': {
          const { error } = await supabase
            .from('favorite_verses')
            .delete()
            .eq('user_id', user.id)
            .eq('verse_id', item.payload.verse_id || item.payload.id);

          if (error) {
            if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
              console.log('favorite_verses table not found, skipping sync');
              return true;
            }
            throw error;
          }
          return true;
        }

        case 'add_reflection': {
          const { error } = await supabase
            .from('reflections')
            .insert({
              id: item.payload.id,
              user_id: user.id,
              verse_id: item.payload.verse_id,
              verse_text: item.payload.verse_text,
              verse_reference: item.payload.verse_reference,
              content: item.payload.content,
              mood: item.payload.mood,
              created_at: item.payload.created_at,
              updated_at: item.payload.updated_at,
            });

          if (error) {
            if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
              console.log('reflections table not found, skipping sync');
              return true;
            }
            // Handle duplicate key error (already synced)
            if (error.code === '23505') {
              return true;
            }
            throw error;
          }
          return true;
        }

        case 'update_reflection': {
          const { error } = await supabase
            .from('reflections')
            .update({
              content: item.payload.content,
              verse_id: item.payload.verse_id,
              verse_text: item.payload.verse_text,
              verse_reference: item.payload.verse_reference,
              mood: item.payload.mood,
              updated_at: item.payload.updated_at,
            })
            .eq('id', item.payload.id)
            .eq('user_id', user.id);

          if (error) {
            if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
              console.log('reflections table not found, skipping sync');
              return true;
            }
            throw error;
          }
          return true;
        }

        case 'delete_reflection': {
          const { error } = await supabase
            .from('reflections')
            .delete()
            .eq('id', item.payload.id)
            .eq('user_id', user.id);

          if (error) {
            if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
              console.log('reflections table not found, skipping sync');
              return true;
            }
            throw error;
          }
          return true;
        }

        default:
          console.warn('Unknown sync action type:', item.type);
          return true;
      }
    } catch (error: any) {
      console.error('Error processing queue item:', error);
      updateQueueItemStatus(item.id, 'failed', true);
      return false;
    }
  };

  // Process the entire queue
  const processQueue = useCallback(async () => {
    if (!user || !isOnline || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    setLastSyncAttempt(new Date());

    const queue = getSyncQueue();
    const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'failed');

    if (pendingItems.length === 0) {
      setIsSyncing(false);
      processingRef.current = false;
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of pendingItems) {
      // Check if we're still online
      if (!navigator.onLine) {
        setSyncError('Conexão perdida durante a sincronização');
        break;
      }

      // Skip items that have exceeded max retries
      if (item.retryCount >= 3) {
        failCount++;
        continue;
      }

      const success = await processQueueItem(item);
      
      if (success) {
        removeFromSyncQueue(item.id);
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between operations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    updatePendingCount();
    setIsSyncing(false);
    processingRef.current = false;

    if (successCount > 0 && failCount === 0) {
      toast.success('Sincronização concluída!', {
        description: `${successCount} ${successCount === 1 ? 'item sincronizado' : 'itens sincronizados'} com sucesso.`,
      });
    } else if (successCount > 0 && failCount > 0) {
      toast.warning('Sincronização parcial', {
        description: `${successCount} sincronizado(s), ${failCount} com erro(s).`,
      });
      setSyncError(`${failCount} item(ns) falharam na sincronização`);
    } else if (failCount > 0) {
      toast.error('Erro na sincronização', {
        description: 'Alguns itens não puderam ser sincronizados. Tentaremos novamente.',
      });
      setSyncError('Falha ao sincronizar alguns itens');
    }
  }, [user, isOnline, updatePendingCount]);

  // Retry failed items
  const retryFailedItems = useCallback(async () => {
    const queue = getSyncQueue();
    const failedItems = queue.filter(item => item.status === 'failed');
    
    // Reset failed items to pending
    failedItems.forEach(item => {
      updateQueueItemStatus(item.id, 'pending');
    });

    updatePendingCount();
    await processQueue();
  }, [processQueue, updatePendingCount]);

  // Clear the queue
  const clearQueue = useCallback(() => {
    clearSyncQueue();
    updatePendingCount();
    toast.info('Fila de sincronização limpa');
  }, [updatePendingCount]);

  // Auto-sync periodically when online
  useEffect(() => {
    if (!user || !isOnline) return;

    // Sync every 30 seconds if there are pending items
    const interval = setInterval(() => {
      if (pendingCount > 0 && !processingRef.current) {
        processQueue();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isOnline, pendingCount, processQueue]);

  const value = {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncAttempt,
    syncError,
    queueAction,
    processQueue,
    clearQueue,
    retryFailedItems,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
