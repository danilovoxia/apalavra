// Sync Queue Manager - Handles offline operations and conflict resolution

export type SyncActionType = 'add_favorite' | 'remove_favorite' | 'add_reflection' | 'update_reflection' | 'delete_reflection';

export interface SyncQueueItem {
  id: string;
  type: SyncActionType;
  payload: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
  conflictResolution?: 'local_wins' | 'remote_wins' | 'merge';
}

export interface ConflictData {
  local: any;
  remote: any;
  type: SyncActionType;
}

const SYNC_QUEUE_KEY = 'syncQueue';
const MAX_RETRIES = 3;

// Get the current sync queue from localStorage
export const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading sync queue:', error);
    return [];
  }
};

// Save the sync queue to localStorage
export const saveSyncQueue = (queue: SyncQueueItem[]): void => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
  }
};

// Add an item to the sync queue
export const addToSyncQueue = (
  type: SyncActionType,
  payload: any,
  conflictResolution: 'local_wins' | 'remote_wins' | 'merge' = 'local_wins'
): SyncQueueItem => {
  const queue = getSyncQueue();
  
  // Check for duplicate operations on the same item
  const existingIndex = queue.findIndex(item => {
    if (item.type === type && item.status === 'pending') {
      // For favorites, check verse_id
      if (type.includes('favorite')) {
        return item.payload.verse_id === payload.verse_id || item.payload.id === payload.id;
      }
      // For reflections, check reflection id
      if (type.includes('reflection')) {
        return item.payload.id === payload.id;
      }
    }
    return false;
  });

  // If we're adding and then removing the same item, cancel both operations
  if (existingIndex !== -1) {
    const existing = queue[existingIndex];
    
    // Cancel out opposite operations
    if (
      (type === 'add_favorite' && existing.type === 'remove_favorite') ||
      (type === 'remove_favorite' && existing.type === 'add_favorite')
    ) {
      queue.splice(existingIndex, 1);
      saveSyncQueue(queue);
      return existing; // Return the cancelled item
    }
    
    // Update existing operation with new data
    if (type === 'update_reflection' && existing.type === 'update_reflection') {
      queue[existingIndex].payload = payload;
      queue[existingIndex].timestamp = new Date().toISOString();
      saveSyncQueue(queue);
      return queue[existingIndex];
    }
  }

  const newItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
    conflictResolution,
  };

  queue.push(newItem);
  saveSyncQueue(queue);
  
  return newItem;
};

// Remove an item from the sync queue
export const removeFromSyncQueue = (id: string): void => {
  const queue = getSyncQueue();
  const filtered = queue.filter(item => item.id !== id);
  saveSyncQueue(filtered);
};

// Update an item's status in the queue
export const updateQueueItemStatus = (
  id: string,
  status: 'pending' | 'processing' | 'failed',
  incrementRetry: boolean = false
): void => {
  const queue = getSyncQueue();
  const index = queue.findIndex(item => item.id === id);
  
  if (index !== -1) {
    queue[index].status = status;
    if (incrementRetry) {
      queue[index].retryCount += 1;
    }
    saveSyncQueue(queue);
  }
};

// Get pending items count
export const getPendingCount = (): number => {
  const queue = getSyncQueue();
  return queue.filter(item => item.status === 'pending' || item.status === 'failed').length;
};

// Clear all items from the queue
export const clearSyncQueue = (): void => {
  saveSyncQueue([]);
};

// Clear failed items that exceeded max retries
export const clearFailedItems = (): void => {
  const queue = getSyncQueue();
  const filtered = queue.filter(item => !(item.status === 'failed' && item.retryCount >= MAX_RETRIES));
  saveSyncQueue(filtered);
};

// Conflict resolution strategies
export const resolveConflict = (
  local: any,
  remote: any,
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'newest_wins' = 'newest_wins'
): any => {
  switch (strategy) {
    case 'local_wins':
      return local;
    
    case 'remote_wins':
      return remote;
    
    case 'merge':
      // Deep merge local and remote, with local taking precedence for conflicts
      return deepMerge(remote, local);
    
    case 'newest_wins':
    default:
      // Compare timestamps and use the newest
      const localTime = new Date(local.updated_at || local.timestamp || local.created_at || 0).getTime();
      const remoteTime = new Date(remote.updated_at || remote.timestamp || remote.created_at || 0).getTime();
      return localTime >= remoteTime ? local : remote;
  }
};

// Deep merge utility
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Get items by type
export const getQueueItemsByType = (type: SyncActionType): SyncQueueItem[] => {
  const queue = getSyncQueue();
  return queue.filter(item => item.type === type);
};

// Check if an item is in the queue
export const isInSyncQueue = (type: SyncActionType, identifier: string): boolean => {
  const queue = getSyncQueue();
  return queue.some(item => {
    if (item.type !== type) return false;
    
    if (type.includes('favorite')) {
      return item.payload.verse_id === identifier || item.payload.id === identifier;
    }
    if (type.includes('reflection')) {
      return item.payload.id === identifier;
    }
    return false;
  });
};
