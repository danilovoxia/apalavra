import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface ShareEvent {
  id: string;
  user_id: string | null;
  verse_reference: string;
  verse_book: string;
  channel: 'whatsapp' | 'copy' | 'native_share' | 'download';
  device_type: 'mobile' | 'desktop';
  with_image: boolean;
  created_at: string;
  synced?: boolean;
}

export interface ShareStats {
  totalShares: number;
  sharesByChannel: Record<string, number>;
  sharesByDevice: Record<string, number>;
  topVerses: Array<{ reference: string; book: string; count: number }>;
  sharesByHour: Record<number, number>;
  sharesByDay: Record<string, number>;
  uniqueUsers: number;
  sharesWithImage: number;
  sharesWithoutImage: number;
  topUsers: Array<{ userId: string; count: number }>;
}

interface ShareAnalyticsContextType {
  trackShare: (event: Omit<ShareEvent, 'id' | 'user_id' | 'created_at' | 'synced'>) => Promise<void>;
  getStats: (days?: number) => ShareStats;
  getUserStats: () => { totalShares: number; recentShares: ShareEvent[]; sharesByChannel: Record<string, number> };
  isLoading: boolean;
  syncPending: number;
}

const ShareAnalyticsContext = createContext<ShareAnalyticsContextType | undefined>(undefined);

const STORAGE_KEY = 'share_analytics_events';
const MAX_LOCAL_EVENTS = 1000;

// Helper to detect device type
const getDeviceType = (): 'mobile' | 'desktop' => {
  if (typeof navigator === 'undefined') return 'desktop';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';
};

// Generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ShareAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ShareEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncPending, setSyncPending] = useState(0);

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ShareEvent[];
        setEvents(parsed);
        setSyncPending(parsed.filter(e => !e.synced).length);
      }
    } catch (error) {
      console.error('Error loading share analytics:', error);
    }
    setIsLoading(false);
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        // Keep only the most recent events
        const toStore = events.slice(-MAX_LOCAL_EVENTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch (error) {
        console.error('Error saving share analytics:', error);
      }
    }
  }, [events, isLoading]);

  // Sync unsynced events to Supabase
  const syncToSupabase = useCallback(async (newEvents: ShareEvent[]) => {
    const unsyncedEvents = newEvents.filter(e => !e.synced);
    if (unsyncedEvents.length === 0) return;

    try {
      const { error } = await supabase
        .from('share_analytics')
        .insert(unsyncedEvents.map(e => ({
          id: e.id,
          user_id: e.user_id,
          verse_reference: e.verse_reference,
          verse_book: e.verse_book,
          channel: e.channel,
          device_type: e.device_type,
          with_image: e.with_image,
          created_at: e.created_at
        })));

      if (!error) {
        // Mark events as synced
        setEvents(prev => prev.map(e => 
          unsyncedEvents.find(u => u.id === e.id) ? { ...e, synced: true } : e
        ));
        setSyncPending(0);
      }
    } catch (error) {
      // Silently fail - will retry on next track
      console.log('Sync to Supabase failed, will retry later');
    }
  }, []);

  // Track a share event
  const trackShare = useCallback(async (
    eventData: Omit<ShareEvent, 'id' | 'user_id' | 'created_at' | 'synced'>
  ) => {
    const newEvent: ShareEvent = {
      id: generateId(),
      user_id: user?.id || null,
      verse_reference: eventData.verse_reference,
      verse_book: eventData.verse_book,
      channel: eventData.channel,
      device_type: eventData.device_type || getDeviceType(),
      with_image: eventData.with_image,
      created_at: new Date().toISOString(),
      synced: false
    };

    setEvents(prev => {
      const updated = [...prev, newEvent];
      setSyncPending(updated.filter(e => !e.synced).length);
      
      // Try to sync in background
      syncToSupabase(updated);
      
      return updated;
    });
  }, [user, syncToSupabase]);

  // Get aggregated stats
  const getStats = useCallback((days: number = 30): ShareStats => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const filteredEvents = events.filter(e => new Date(e.created_at) >= startDate);

    // Shares by channel
    const sharesByChannel: Record<string, number> = {};
    filteredEvents.forEach(e => {
      sharesByChannel[e.channel] = (sharesByChannel[e.channel] || 0) + 1;
    });

    // Shares by device
    const sharesByDevice: Record<string, number> = {};
    filteredEvents.forEach(e => {
      sharesByDevice[e.device_type] = (sharesByDevice[e.device_type] || 0) + 1;
    });

    // Top verses
    const verseCounts: Record<string, { count: number; book: string }> = {};
    filteredEvents.forEach(e => {
      if (!verseCounts[e.verse_reference]) {
        verseCounts[e.verse_reference] = { count: 0, book: e.verse_book };
      }
      verseCounts[e.verse_reference].count++;
    });
    const topVerses = Object.entries(verseCounts)
      .map(([reference, data]) => ({ reference, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Shares by hour
    const sharesByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) sharesByHour[i] = 0;
    filteredEvents.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      sharesByHour[hour]++;
    });

    // Shares by day
    const sharesByDay: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const day = new Date(e.created_at).toISOString().split('T')[0];
      sharesByDay[day] = (sharesByDay[day] || 0) + 1;
    });

    // Unique users
    const uniqueUsers = new Set(filteredEvents.filter(e => e.user_id).map(e => e.user_id)).size;

    // With/without image
    const sharesWithImage = filteredEvents.filter(e => e.with_image).length;
    const sharesWithoutImage = filteredEvents.length - sharesWithImage;

    // Top users
    const userCounts: Record<string, number> = {};
    filteredEvents.filter(e => e.user_id).forEach(e => {
      userCounts[e.user_id!] = (userCounts[e.user_id!] || 0) + 1;
    });
    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalShares: filteredEvents.length,
      sharesByChannel,
      sharesByDevice,
      topVerses,
      sharesByHour,
      sharesByDay,
      uniqueUsers,
      sharesWithImage,
      sharesWithoutImage,
      topUsers
    };
  }, [events]);

  // Get stats for current user
  const getUserStats = useCallback(() => {
    const userEvents = user?.id 
      ? events.filter(e => e.user_id === user.id)
      : events;

    const sharesByChannel: Record<string, number> = {};
    userEvents.forEach(e => {
      sharesByChannel[e.channel] = (sharesByChannel[e.channel] || 0) + 1;
    });

    return {
      totalShares: userEvents.length,
      recentShares: userEvents.slice(-50).reverse(),
      sharesByChannel
    };
  }, [events, user]);

  return (
    <ShareAnalyticsContext.Provider
      value={{
        trackShare,
        getStats,
        getUserStats,
        isLoading,
        syncPending
      }}
    >
      {children}
    </ShareAnalyticsContext.Provider>
  );
};

export const useShareAnalytics = () => {
  const context = useContext(ShareAnalyticsContext);
  if (!context) {
    throw new Error('useShareAnalytics must be used within ShareAnalyticsProvider');
  }
  return context;
};
