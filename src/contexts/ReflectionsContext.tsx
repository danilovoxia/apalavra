import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { addToSyncQueue, getSyncQueue, removeFromSyncQueue } from '@/lib/syncQueue';

export interface Reflection {
  id: string;
  user_id: string;
  verse_id: string;
  verse_text: string;
  verse_reference: string;
  content: string;
  mood: string;
  created_at: string;
  updated_at: string;
  localOnly?: boolean;
  syncedAt?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface ReflectionsContextType {
  reflections: Reflection[];
  loading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;
  pendingCount: number;
  addReflection: (reflection: Omit<Reflection, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Reflection>;
  updateReflection: (id: string, updates: Partial<Reflection>) => Promise<void>;
  deleteReflection: (id: string) => Promise<void>;
  syncReflections: () => Promise<void>;
  retrySync: () => Promise<void>;
}

const ReflectionsContext = createContext<ReflectionsContextType | undefined>(undefined);

export const useReflections = () => {
  const context = useContext(ReflectionsContext);
  if (!context) {
    throw new Error('useReflections must be used within a ReflectionsProvider');
  }
  return context;
};

interface ReflectionsProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_BASE_KEY = 'reflections';

const getStorageKey = (userId?: string | null): string => {
  if (userId) {
    return `${LOCAL_STORAGE_BASE_KEY}_${userId}`;
  }
  return LOCAL_STORAGE_BASE_KEY;
};

export const ReflectionsProvider: React.FC<ReflectionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const previousUserRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Count pending reflections
  const pendingCount = reflections.filter(r => r.localOnly).length;

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn('ReflectionsContext: Timeout de loading atingido, carregando do localStorage');
        loadFromLocalStorage();
        setLoading(false);
        setSyncStatus('idle');
      }
    }, 10000); // 10 segundos de timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Limpa o timeout quando o loading termina
  useEffect(() => {
    if (!loading && loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [loading]);

  // Monitor online/offline status

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user && !isSyncingRef.current) {
        processPendingQueue();
        syncReflections();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setIsOnline(false);
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Process pending queue items
  const processPendingQueue = async () => {
    if (!user || !navigator.onLine) return;

    const queue = getSyncQueue();
    const reflectionItems = queue.filter(item => 
      item.type === 'add_reflection' || 
      item.type === 'update_reflection' || 
      item.type === 'delete_reflection'
    );

    for (const item of reflectionItems) {
      try {
        if (item.type === 'add_reflection') {
          const { error } = await supabase
            .from('reflections')
            .upsert({
              id: item.payload.id,
              user_id: user.id,
              verse_id: item.payload.verse_id,
              verse_text: item.payload.verse_text,
              verse_reference: item.payload.verse_reference,
              content: item.payload.content,
              mood: item.payload.mood,
              created_at: item.payload.created_at,
              updated_at: item.payload.updated_at,
            }, {
              onConflict: 'id'
            });

          if (!error || error.code === 'PGRST205' || error.code === '42P01') {
            removeFromSyncQueue(item.id);
          }
        } else if (item.type === 'update_reflection') {
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

          if (!error || error.code === 'PGRST205' || error.code === '42P01') {
            removeFromSyncQueue(item.id);
          }
        } else if (item.type === 'delete_reflection') {
          const { error } = await supabase
            .from('reflections')
            .delete()
            .eq('id', item.payload.id)
            .eq('user_id', user.id);

          if (!error || error.code === 'PGRST205' || error.code === '42P01') {
            removeFromSyncQueue(item.id);
          }
        }
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
    }
  };

  // Migrate old localStorage data
  const migrateOldData = (userId: string) => {
    const oldKey = LOCAL_STORAGE_BASE_KEY;
    const newKey = getStorageKey(userId);
    
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);
    
    if (oldData && !newData) {
      try {
        const oldReflections = JSON.parse(oldData);
        if (Array.isArray(oldReflections) && oldReflections.length > 0) {
          const userReflections = oldReflections.filter(
            (r: Reflection) => r.user_id === userId || r.user_id === 'local'
          );
          if (userReflections.length > 0) {
            const migratedReflections = userReflections.map((r: Reflection) => ({
              ...r,
              user_id: userId,
            }));
            localStorage.setItem(newKey, JSON.stringify(migratedReflections));
            console.log(`Migrated ${migratedReflections.length} reflections to user-specific storage`);
          }
        }
      } catch (e) {
        console.error('Error migrating old reflections data:', e);
      }
    }
  };

  // Load reflections when user changes
  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = previousUserRef.current;

    if (isSyncingRef.current) {
      return;
    }

    if (currentUserId && !previousUserId) {
      migrateOldData(currentUserId);
      handleUserLogin();
    } else if (!currentUserId && previousUserId) {
      handleUserLogout();
    } else if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      loadReflections();
    }

    previousUserRef.current = currentUserId;
  }, [user]);

  const handleUserLogin = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    setLoading(true);
    setSyncStatus('syncing');

    try {
      const localReflections = getLocalReflections();
      const remoteReflections = await fetchRemoteReflections();
      const mergedReflections = mergeReflections(localReflections, remoteReflections);
      
      setReflections(mergedReflections);
      saveToLocalStorage(mergedReflections);
      
      await syncToSupabase(mergedReflections, remoteReflections);
      await processPendingQueue();
      
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
      
      const newCount = mergedReflections.length - remoteReflections.length;
      if (newCount > 0) {
        toast.success('Reflexões sincronizadas!', {
          description: `${newCount} reflexão(ões) local(is) foram adicionadas à sua conta.`,
        });
      }
    } catch (error: any) {
      console.error('Error during login sync:', error);
      setSyncStatus('synced');
      setSyncError(null);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
      isSyncingRef.current = false;
    }
  };

  const handleUserLogout = () => {
    const localReflections = reflections.map(r => ({ ...r, localOnly: true, syncedAt: undefined }));
    setReflections(localReflections);
    localStorage.setItem(LOCAL_STORAGE_BASE_KEY, JSON.stringify(localReflections));
    setSyncStatus('idle');
    setLastSyncedAt(null);
  };

  const loadReflections = async () => {
    if (isSyncingRef.current) {
      loadFromLocalStorage();
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    if (user) {
      migrateOldData(user.id);
      
      if (!navigator.onLine) {
        setSyncStatus('offline');
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      try {
        setSyncStatus('syncing');
        const remoteReflections = await fetchRemoteReflections();
        const localReflections = getLocalReflections();
        const mergedReflections = mergeReflections(localReflections, remoteReflections);
        
        setReflections(mergedReflections);
        saveToLocalStorage(mergedReflections);
        
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
        setSyncError(null);
      } catch (error: any) {
        console.error('Error loading reflections:', error);
        setSyncStatus('synced');
        setSyncError(null);
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
      setSyncStatus('idle');
    }
    
    setLoading(false);
  };

  const fetchRemoteReflections = async (): Promise<Reflection[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
        console.log('reflections table not found, using local storage only');
        return [];
      }
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      localOnly: false,
      syncedAt: item.updated_at || item.created_at,
    }));
  };

  const getLocalReflections = (): Reflection[] => {
    const storageKey = getStorageKey(user?.id);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const loadFromLocalStorage = () => {
    setReflections(getLocalReflections());
  };

  const saveToLocalStorage = (newReflections: Reflection[]) => {
    const storageKey = getStorageKey(user?.id);
    localStorage.setItem(storageKey, JSON.stringify(newReflections));
  };

  const mergeReflections = (local: Reflection[], remote: Reflection[]): Reflection[] => {
    const mergedMap = new Map<string, Reflection>();

    remote.forEach(ref => {
      mergedMap.set(ref.id, { ...ref, localOnly: false });
    });

    local.forEach(localRef => {
      const existing = mergedMap.get(localRef.id);
      
      if (!existing) {
        mergedMap.set(localRef.id, { ...localRef, localOnly: true });
      } else {
        const localDate = new Date(localRef.updated_at || localRef.created_at || 0);
        const remoteDate = new Date(existing.updated_at || existing.created_at || 0);
        
        if (localDate > remoteDate) {
          mergedMap.set(localRef.id, { ...localRef, localOnly: false, syncedAt: existing.syncedAt });
        }
      }
    });

    return Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  };

  const syncToSupabase = async (merged: Reflection[], existing: Reflection[]) => {
    if (!user) return;

    const existingIds = new Set(existing.map(r => r.id));
    const newReflections = merged.filter(r => !existingIds.has(r.id) || r.localOnly);

    if (newReflections.length === 0) return;

    const toInsert = newReflections.map(ref => ({
      id: ref.id,
      user_id: user.id,
      verse_id: ref.verse_id,
      verse_text: ref.verse_text,
      verse_reference: ref.verse_reference,
      content: ref.content,
      mood: ref.mood,
      created_at: ref.created_at,
      updated_at: ref.updated_at,
    }));

    const { error } = await supabase
      .from('reflections')
      .upsert(toInsert, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
        console.log('reflections table not found, using local storage only');
        return;
      }
      console.error('Error syncing to Supabase:', error);
      throw error;
    }
  };

  const syncReflections = useCallback(async () => {
    if (!user || !navigator.onLine || isSyncingRef.current) {
      if (!navigator.onLine) setSyncStatus('offline');
      return;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const localReflections = reflections;
      const remoteReflections = await fetchRemoteReflections();
      const mergedReflections = mergeReflections(localReflections, remoteReflections);
      
      setReflections(mergedReflections);
      saveToLocalStorage(mergedReflections);
      
      await syncToSupabase(mergedReflections, remoteReflections);
      
      // Mark all as synced
      const syncedReflections = mergedReflections.map(r => ({ ...r, localOnly: false }));
      setReflections(syncedReflections);
      saveToLocalStorage(syncedReflections);
      
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus('synced');
      setSyncError(null);
    } finally {
      isSyncingRef.current = false;
    }
  }, [user, reflections]);

  const retrySync = useCallback(async () => {
    await syncReflections();
  }, [syncReflections]);

  const addReflection = async (reflectionData: Omit<Reflection, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Reflection> => {
    const now = new Date().toISOString();
    const newReflection: Reflection = {
      ...reflectionData,
      id: crypto.randomUUID(),
      user_id: user?.id || 'local',
      created_at: now,
      updated_at: now,
      localOnly: !user || !isOnline,
    };

    const newReflections = [newReflection, ...reflections];
    setReflections(newReflections);
    saveToLocalStorage(newReflections);

    if (user && isOnline) {
      try {
        setSyncStatus('syncing');
        
        const { error } = await supabase
          .from('reflections')
          .insert({
            id: newReflection.id,
            user_id: user.id,
            verse_id: newReflection.verse_id,
            verse_text: newReflection.verse_text,
            verse_reference: newReflection.verse_reference,
            content: newReflection.content,
            mood: newReflection.mood,
            created_at: now,
            updated_at: now,
          });

        if (error) {
          if (error.code !== 'PGRST205' && error.code !== '42P01') {
            console.error('Error saving to Supabase:', error);
            addToSyncQueue('add_reflection', newReflection);
          }
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        } else {
          const updatedReflections = newReflections.map(r => 
            r.id === newReflection.id ? { ...r, localOnly: false, syncedAt: now } : r
          );
          setReflections(updatedReflections);
          saveToLocalStorage(updatedReflections);
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        }
      } catch (error: any) {
        console.error('Error saving reflection:', error);
        addToSyncQueue('add_reflection', newReflection);
        setSyncStatus('offline');
      }
    } else if (!isOnline && user) {
      setSyncStatus('offline');
      addToSyncQueue('add_reflection', newReflection);
    }

    return newReflection;
  };

  const updateReflection = async (id: string, updates: Partial<Reflection>) => {
    const now = new Date().toISOString();
    const updatedReflection = reflections.find(r => r.id === id);
    
    if (!updatedReflection) return;

    const newReflection: Reflection = {
      ...updatedReflection,
      ...updates,
      updated_at: now,
      localOnly: !user || !isOnline,
    };

    const newReflections = reflections.map(r => r.id === id ? newReflection : r);
    setReflections(newReflections);
    saveToLocalStorage(newReflections);

    if (user && isOnline) {
      try {
        setSyncStatus('syncing');
        
        const { error } = await supabase
          .from('reflections')
          .update({
            content: newReflection.content,
            verse_id: newReflection.verse_id,
            verse_text: newReflection.verse_text,
            verse_reference: newReflection.verse_reference,
            mood: newReflection.mood,
            updated_at: now,
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          if (error.code !== 'PGRST205' && error.code !== '42P01') {
            console.error('Error updating in Supabase:', error);
            addToSyncQueue('update_reflection', newReflection);
          }
        } else {
          const syncedReflections = newReflections.map(r => 
            r.id === id ? { ...r, localOnly: false, syncedAt: now } : r
          );
          setReflections(syncedReflections);
          saveToLocalStorage(syncedReflections);
        }
        
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (error: any) {
        console.error('Error updating reflection:', error);
        addToSyncQueue('update_reflection', newReflection);
        setSyncStatus('offline');
      }
    } else if (!isOnline && user) {
      setSyncStatus('offline');
      addToSyncQueue('update_reflection', newReflection);
    }
  };

  const deleteReflection = async (id: string) => {
    const deletedReflection = reflections.find(r => r.id === id);
    
    const newReflections = reflections.filter(r => r.id !== id);
    setReflections(newReflections);
    saveToLocalStorage(newReflections);

    if (user && isOnline) {
      try {
        setSyncStatus('syncing');
        
        const { error } = await supabase
          .from('reflections')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          if (error.code !== 'PGRST205' && error.code !== '42P01') {
            console.error('Error deleting from Supabase:', error);
            if (deletedReflection) {
              setReflections([deletedReflection, ...newReflections]);
              saveToLocalStorage([deletedReflection, ...newReflections]);
            }
            addToSyncQueue('delete_reflection', { id });
          }
        }
        
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (error: any) {
        console.error('Error deleting reflection:', error);
        addToSyncQueue('delete_reflection', { id });
        setSyncStatus('offline');
      }
    } else if (!isOnline && user) {
      setSyncStatus('offline');
      addToSyncQueue('delete_reflection', { id });
    }
  };

  const value = {
    reflections,
    loading,
    syncStatus,
    lastSyncedAt,
    syncError,
    pendingCount,
    addReflection,
    updateReflection,
    deleteReflection,
    syncReflections,
    retrySync,
  };

  return (
    <ReflectionsContext.Provider value={value}>
      {children}
    </ReflectionsContext.Provider>
  );
};
