'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getBackgroundSyncManager, 
  addFavoriteToSync, 
  addCartToSync, 
  addFormToSync, 
  addImageToSync,
  SyncItem 
} from '@/utils/backgroundSync';

interface UseBackgroundSyncReturn {
  isOnline: boolean;
  queueLength: number;
  pendingItems: SyncItem[];
  addFavorite: (eventId: string, action: 'add' | 'remove') => Promise<void>;
  addCart: (items: any[]) => Promise<void>;
  addForm: (formId: string, formData: any) => Promise<void>;
  addImage: (imageId: string, imageData: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  syncStatus: {
    isOnline: boolean;
    queueLength: number;
    pendingItems: SyncItem[];
  };
}

export function useBackgroundSync(): UseBackgroundSyncReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);
  const [pendingItems, setPendingItems] = useState<SyncItem[]>([]);
  const [syncManager] = useState(() => getBackgroundSyncManager());

  // Update sync status
  const updateSyncStatus = useCallback(() => {
    const status = syncManager.getSyncStatus();
    setIsOnline(status.isOnline);
    setQueueLength(status.queueLength);
    setPendingItems(status.pendingItems);
  }, [syncManager]);

  // Load pending items on mount
  useEffect(() => {
    const loadPendingItems = async () => {
      try {
        await syncManager.loadPendingItems();
        updateSyncStatus();
      } catch (error) {
        console.error('Failed to load pending items:', error);
      }
    };

    loadPendingItems();
  }, [syncManager, updateSyncStatus]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateSyncStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateSyncStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateSyncStatus]);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, [updateSyncStatus]);

  // Add favorite to sync queue
  const addFavorite = useCallback(async (eventId: string, action: 'add' | 'remove') => {
    try {
      await addFavoriteToSync(eventId, action);
      updateSyncStatus();
    } catch (error) {
      console.error('Failed to add favorite to sync:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Add cart to sync queue
  const addCart = useCallback(async (items: any[]) => {
    try {
      await addCartToSync(items);
      updateSyncStatus();
    } catch (error) {
      console.error('Failed to add cart to sync:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Add form to sync queue
  const addForm = useCallback(async (formId: string, formData: any) => {
    try {
      await addFormToSync(formId, formData);
      updateSyncStatus();
    } catch (error) {
      console.error('Failed to add form to sync:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Add image to sync queue
  const addImage = useCallback(async (imageId: string, imageData: string) => {
    try {
      await addImageToSync(imageId, imageData);
      updateSyncStatus();
    } catch (error) {
      console.error('Failed to add image to sync:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Clear sync queue
  const clearQueue = useCallback(async () => {
    try {
      await syncManager.clearSyncQueue();
      updateSyncStatus();
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
      throw error;
    }
  }, [syncManager, updateSyncStatus]);

  return {
    isOnline,
    queueLength,
    pendingItems,
    addFavorite,
    addCart,
    addForm,
    addImage,
    clearQueue,
    syncStatus: {
      isOnline,
      queueLength,
      pendingItems
    }
  };
}

// Hook for favorites sync
export function useFavoritesSync() {
  const { addFavorite, isOnline, queueLength } = useBackgroundSync();

  const toggleFavorite = useCallback(async (eventId: string, isFavorite: boolean) => {
    try {
      if (isOnline) {
        // Try to sync immediately
        const response = await fetch('/api/favorites', {
          method: isFavorite ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });

        if (!response.ok) {
          throw new Error('Failed to sync favorite');
        }
      } else {
        // Add to sync queue
        await addFavorite(eventId, isFavorite ? 'add' : 'remove');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }, [addFavorite, isOnline]);

  return {
    toggleFavorite,
    isOnline,
    queueLength
  };
}

// Hook for cart sync
export function useCartSync() {
  const { addCart, isOnline, queueLength } = useBackgroundSync();

  const syncCart = useCallback(async (items: any[]) => {
    try {
      if (isOnline) {
        // Try to sync immediately
        const response = await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });

        if (!response.ok) {
          throw new Error('Failed to sync cart');
        }
      } else {
        // Add to sync queue
        await addCart(items);
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
      throw error;
    }
  }, [addCart, isOnline]);

  return {
    syncCart,
    isOnline,
    queueLength
  };
}

// Hook for form sync
export function useFormSync() {
  const { addForm, isOnline, queueLength } = useBackgroundSync();

  const syncForm = useCallback(async (formId: string, formData: any) => {
    try {
      if (isOnline) {
        // Try to sync immediately
        const response = await fetch(`/api/forms/${formId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to sync form');
        }
      } else {
        // Add to sync queue
        await addForm(formId, formData);
      }
    } catch (error) {
      console.error('Failed to sync form:', error);
      throw error;
    }
  }, [addForm, isOnline]);

  return {
    syncForm,
    isOnline,
    queueLength
  };
}

// Hook for image sync
export function useImageSync() {
  const { addImage, isOnline, queueLength } = useBackgroundSync();

  const syncImage = useCallback(async (imageId: string, imageData: string) => {
    try {
      if (isOnline) {
        // Try to sync immediately
        const response = await fetch('/api/images/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, imageData })
        });

        if (!response.ok) {
          throw new Error('Failed to sync image');
        }
      } else {
        // Add to sync queue
        await addImage(imageId, imageData);
      }
    } catch (error) {
      console.error('Failed to sync image:', error);
      throw error;
    }
  }, [addImage, isOnline]);

  return {
    syncImage,
    isOnline,
    queueLength
  };
}
