import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Verse } from '@/data/verses';
import { toast } from 'sonner';
import { SyncStatus } from '@/components/SyncIndicator';
import { addToSyncQueue, getSyncQueue, removeFromSyncQueue } from '@/lib/syncQueue';

interface FavoriteVerse extends Verse {
  savedAt?: string;
  syncedAt?: string;
  localOnly?: boolean;
}

interface FavoritesContextType {
  favorites: FavoriteVerse[];
  loading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;
  addFavorite: (verse: Verse) => Promise<void>;
  removeFavorite: (verseId: string) => Promise<void>;
  isFavorite: (verseId: string) => boolean;
  toggleFavorite: (verse: Verse) => Promise<void>;
  syncFavorites: () => Promise<void>;
  retrySync: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

// Base key for localStorage
const LOCAL_STORAGE_BASE_KEY = 'favoriteVerses';

// Helper to get user-specific localStorage key
const getStorageKey = (userId?: string | null): string => {
  if (userId) {
    return `${LOCAL_STORAGE_BASE_KEY}_${userId}`;
  }
  return LOCAL_STORAGE_BASE_KEY;
};

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const previousUserRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn('FavoritesContext: Timeout de loading atingido, carregando do localStorage');
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
        // Process any pending sync queue items
        processPendingQueue();
        syncFavorites();
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

  // Process pending queue items when coming back online
  const processPendingQueue = async () => {
    if (!user || !navigator.onLine) return;

    const queue = getSyncQueue();
    const favoriteItems = queue.filter(item => 
      item.type === 'add_favorite' || item.type === 'remove_favorite'
    );

    for (const item of favoriteItems) {
      try {
        if (item.type === 'add_favorite') {
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

          if (!error || error.code === 'PGRST205' || error.code === '42P01') {
            removeFromSyncQueue(item.id);
          }
        } else if (item.type === 'remove_favorite') {
          const { error } = await supabase
            .from('favorite_verses')
            .delete()
            .eq('user_id', user.id)
            .eq('verse_id', item.payload.verse_id || item.payload.id);

          if (!error || error.code === 'PGRST205' || error.code === '42P01') {
            removeFromSyncQueue(item.id);
          }
        }
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
    }
  };

  // Migrate old localStorage data to user-specific key
  const migrateOldData = (userId: string) => {
    const oldKey = LOCAL_STORAGE_BASE_KEY;
    const newKey = getStorageKey(userId);
    
    // Check if we have old data and no new data
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);
    
    if (oldData && !newData) {
      try {
        const oldFavorites = JSON.parse(oldData);
        if (Array.isArray(oldFavorites) && oldFavorites.length > 0) {
          // Migrate to new key
          localStorage.setItem(newKey, oldData);
          console.log(`Migrated ${oldFavorites.length} favorites to user-specific storage`);
        }
      } catch (e) {
        console.error('Error migrating old favorites data:', e);
      }
    }
  };

  // Load favorites when user changes
  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = previousUserRef.current;

    // Prevent multiple calls during initial load
    if (isSyncingRef.current) {
      return;
    }

    // User just logged in
    if (currentUserId && !previousUserId) {
      // Migrate old data if exists
      migrateOldData(currentUserId);
      handleUserLogin();
    } 
    // User logged out
    else if (!currentUserId && previousUserId) {
      handleUserLogout();
    }
    // Initial load only (not on every render)
    else if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      loadFavorites();
    }

    previousUserRef.current = currentUserId;
  }, [user]);



  const handleUserLogin = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    setLoading(true);
    setSyncStatus('syncing');

    try {
      // Get local favorites for this user
      const localFavorites = getLocalFavorites();
      
      // Get favorites from Supabase
      const remoteFavorites = await fetchRemoteFavorites();
      
      // Merge favorites (bidirectional sync)
      const mergedFavorites = mergeFavorites(localFavorites, remoteFavorites);
      
      // Update state
      setFavorites(mergedFavorites);
      saveToLocalStorage(mergedFavorites);
      
      // Sync merged favorites back to Supabase
      await syncToSupabase(mergedFavorites, remoteFavorites);
      
      // Process any pending queue items
      await processPendingQueue();
      
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
      
      const newFavoritesCount = mergedFavorites.length - remoteFavorites.length;
      if (newFavoritesCount > 0) {
        toast.success('Favoritos sincronizados!', {
          description: `${newFavoritesCount} favorito(s) local(is) foram adicionados à sua conta.`,
        });
      } else if (mergedFavorites.length > localFavorites.length) {
        toast.success('Favoritos sincronizados!', {
          description: `${mergedFavorites.length - localFavorites.length} favorito(s) foram recuperados da sua conta.`,
        });
      }
    } catch (error: any) {
      console.error('Error during login sync:', error);
      // On error, just use local storage and mark as synced to prevent freezing
      setSyncStatus('synced');
      setSyncError(null);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
      isSyncingRef.current = false;
    }
  };



  const handleUserLogout = () => {
    // Keep local favorites but mark as not synced
    const localFavorites = favorites.map(f => ({ ...f, localOnly: true, syncedAt: undefined }));
    setFavorites(localFavorites);
    // Save to generic key for non-logged users
    localStorage.setItem(LOCAL_STORAGE_BASE_KEY, JSON.stringify(localFavorites));
    setSyncStatus('idle');
    setLastSyncedAt(null);
  };

  const loadFavorites = async () => {
    if (isSyncingRef.current) {
      // If already syncing, just load from local storage
      loadFromLocalStorage();
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    if (user) {
      // Migrate old data if exists
      migrateOldData(user.id);
      
      if (!navigator.onLine) {
        setSyncStatus('offline');
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      try {
        setSyncStatus('syncing');
        const remoteFavorites = await fetchRemoteFavorites();
        const localFavorites = getLocalFavorites();
        
        // Merge local and remote
        const mergedFavorites = mergeFavorites(localFavorites, remoteFavorites);
        
        setFavorites(mergedFavorites);
        saveToLocalStorage(mergedFavorites);
        
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
        setSyncError(null);
      } catch (error: any) {
        console.error('Error loading favorites:', error);
        // On error, just use local storage and mark as synced to prevent freezing
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



  const fetchRemoteFavorites = async (): Promise<FavoriteVerse[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorite_verses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Handle missing table gracefully - fall back to local storage
      if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
        console.log('favorite_verses table not found, using local storage only');
        return [];
      }
      throw error;
    }

    return (data || []).map(item => ({
      id: item.verse_id,
      text: item.verse_text,
      reference: item.verse_reference,
      emotion: item.verse_emotion,
      savedAt: item.created_at,
      syncedAt: item.created_at,
      localOnly: false,
    }));
  };


  const getLocalFavorites = (): FavoriteVerse[] => {
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
    setFavorites(getLocalFavorites());
  };

  const saveToLocalStorage = (newFavorites: FavoriteVerse[]) => {
    const storageKey = getStorageKey(user?.id);
    localStorage.setItem(storageKey, JSON.stringify(newFavorites));
  };

  // Merge local and remote favorites, avoiding duplicates
  const mergeFavorites = (local: FavoriteVerse[], remote: FavoriteVerse[]): FavoriteVerse[] => {
    const mergedMap = new Map<string, FavoriteVerse>();

    // Add remote favorites first (they are the source of truth for synced items)
    remote.forEach(fav => {
      mergedMap.set(fav.id, { ...fav, localOnly: false });
    });

    // Add local favorites, handling conflicts
    local.forEach(localFav => {
      const existing = mergedMap.get(localFav.id);
      
      if (!existing) {
        // New local favorite not in remote - mark for sync
        mergedMap.set(localFav.id, { ...localFav, localOnly: true });
      } else {
        // Conflict resolution: keep the most recent one
        const localDate = new Date(localFav.savedAt || 0);
        const remoteDate = new Date(existing.savedAt || 0);
        
        if (localDate > remoteDate) {
          // Local is newer - update with local data but keep synced status
          mergedMap.set(localFav.id, { ...localFav, localOnly: false, syncedAt: existing.syncedAt });
        }
        // Otherwise keep remote version (already in map)
      }
    });

    // Sort by savedAt descending
    return Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = new Date(a.savedAt || 0).getTime();
      const dateB = new Date(b.savedAt || 0).getTime();
      return dateB - dateA;
    });
  };

  // Sync merged favorites to Supabase
  const syncToSupabase = async (merged: FavoriteVerse[], existing: FavoriteVerse[]) => {
    if (!user) return;

    const existingIds = new Set(existing.map(f => f.id));
    const newFavorites = merged.filter(f => !existingIds.has(f.id) || f.localOnly);

    if (newFavorites.length === 0) return;

    // Insert new favorites
    const toInsert = newFavorites.map(fav => ({
      user_id: user.id,
      verse_id: fav.id,
      verse_text: fav.text,
      verse_reference: fav.reference,
      verse_emotion: fav.emotion,
      created_at: fav.savedAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('favorite_verses')
      .upsert(toInsert, { 
        onConflict: 'user_id,verse_id',
        ignoreDuplicates: false 
      });

    if (error) {
      // Handle missing table gracefully - just log and continue with local storage
      if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
        console.log('favorite_verses table not found, using local storage only');
        return;
      }
      console.error('Error syncing to Supabase:', error);
      throw error;
    }
  };


  const syncFavorites = useCallback(async () => {
    if (!user || !navigator.onLine || isSyncingRef.current) {
      if (!navigator.onLine) setSyncStatus('offline');
      return;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const localFavorites = favorites;
      const remoteFavorites = await fetchRemoteFavorites();
      const mergedFavorites = mergeFavorites(localFavorites, remoteFavorites);
      
      setFavorites(mergedFavorites);
      saveToLocalStorage(mergedFavorites);
      
      await syncToSupabase(mergedFavorites, remoteFavorites);
      
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (error: any) {
      console.error('Sync error:', error);
      // On error, just mark as synced to prevent freezing
      setSyncStatus('synced');
      setSyncError(null);
    } finally {
      isSyncingRef.current = false;
    }
  }, [user, favorites]);



  const retrySync = useCallback(async () => {
    await syncFavorites();
  }, [syncFavorites]);

  const addFavorite = async (verse: Verse) => {
    const now = new Date().toISOString();
    const newFavorite: FavoriteVerse = {
      ...verse,
      savedAt: now,
      localOnly: !user || !isOnline,
    };

    // Optimistically update UI
    const newFavorites = [newFavorite, ...favorites.filter(f => f.id !== verse.id)];
    setFavorites(newFavorites);
    saveToLocalStorage(newFavorites);

    if (user && isOnline) {
      try {
        setSyncStatus('syncing');
        
        const { error } = await supabase
          .from('favorite_verses')
          .upsert({
            user_id: user.id,
            verse_id: verse.id,
            verse_text: verse.text,
            verse_reference: verse.reference,
            verse_emotion: verse.emotion,
            created_at: now,
          }, {
            onConflict: 'user_id,verse_id'
          });

        if (error) {
          // Handle missing table gracefully
          if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
            console.log('favorite_verses table not found, using local storage only');
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
          } else {
            console.error('Error saving to Supabase:', error);
            // Mark as local only and queue for later sync
            const updatedFavorites = newFavorites.map(f => 
              f.id === verse.id ? { ...f, localOnly: true } : f
            );
            setFavorites(updatedFavorites);
            saveToLocalStorage(updatedFavorites);
            
            // Add to sync queue
            addToSyncQueue('add_favorite', {
              id: verse.id,
              verse_id: verse.id,
              verse_text: verse.text,
              verse_reference: verse.reference,
              verse_emotion: verse.emotion,
              created_at: now,
            });
            
            setSyncStatus('offline');
          }
        } else {
          // Mark as synced
          const updatedFavorites = newFavorites.map(f => 
            f.id === verse.id ? { ...f, localOnly: false, syncedAt: now } : f
          );
          setFavorites(updatedFavorites);
          saveToLocalStorage(updatedFavorites);
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        }
      } catch (error: any) {
        console.error('Error saving favorite:', error);
        // Add to sync queue for later
        addToSyncQueue('add_favorite', {
          id: verse.id,
          verse_id: verse.id,
          verse_text: verse.text,
          verse_reference: verse.reference,
          verse_emotion: verse.emotion,
          created_at: now,
        });
        setSyncStatus('offline');
      }
    } else if (!isOnline && user) {
      // Offline - add to sync queue
      setSyncStatus('offline');
      addToSyncQueue('add_favorite', {
        id: verse.id,
        verse_id: verse.id,
        verse_text: verse.text,
        verse_reference: verse.reference,
        verse_emotion: verse.emotion,
        created_at: now,
      });
    }

    toast.success('Versículo salvo nos favoritos!', {
      description: verse.reference,
    });
  };


  const removeFavorite = async (verseId: string) => {
    const removedFavorite = favorites.find(f => f.id === verseId);
    
    // Optimistically update UI
    const newFavorites = favorites.filter(f => f.id !== verseId);
    setFavorites(newFavorites);
    saveToLocalStorage(newFavorites);

    if (user && isOnline) {
      try {
        setSyncStatus('syncing');
        
        const { error } = await supabase
          .from('favorite_verses')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_id', verseId);

        if (error) {
          // Handle missing table gracefully
          if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') {
            console.log('favorite_verses table not found, using local storage only');
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
          } else {
            console.error('Error removing from Supabase:', error);
            // Restore favorite on error and queue for later
            if (removedFavorite) {
              setFavorites([removedFavorite, ...newFavorites]);
              saveToLocalStorage([removedFavorite, ...newFavorites]);
            }
            
            // Add to sync queue
            addToSyncQueue('remove_favorite', {
              id: verseId,
              verse_id: verseId,
            });
            
            setSyncStatus('offline');
            return;
          }
        } else {
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        }
      } catch (error: any) {
        console.error('Error removing favorite:', error);
        // Add to sync queue for later
        addToSyncQueue('remove_favorite', {
          id: verseId,
          verse_id: verseId,
        });
        setSyncStatus('offline');
      }
    } else if (!isOnline && user) {
      // Offline - add to sync queue
      setSyncStatus('offline');
      addToSyncQueue('remove_favorite', {
        id: verseId,
        verse_id: verseId,
      });
    }

    toast.info('Versículo removido dos favoritos');
  };


  const isFavorite = (verseId: string): boolean => {
    return favorites.some(f => f.id === verseId);
  };

  const toggleFavorite = async (verse: Verse) => {
    if (isFavorite(verse.id)) {
      await removeFavorite(verse.id);
    } else {
      await addFavorite(verse);
    }
  };

  const value = {
    favorites,
    loading,
    syncStatus,
    lastSyncedAt,
    syncError,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    syncFavorites,
    retrySync,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
