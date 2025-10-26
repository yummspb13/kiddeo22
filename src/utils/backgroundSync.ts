// Утилиты для background sync

export interface SyncItem {
  id: string;
  type: 'favorite' | 'cart' | 'form' | 'image';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
  syncInterval?: number;
}

class BackgroundSyncManager {
  private dbName = 'KiddeoBackgroundSync';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: SyncItem[] = [];
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private options: Required<SyncOptions>;

  constructor(options: SyncOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      batchSize: options.batchSize || 10,
      syncInterval: options.syncInterval || 30000
    };

    this.init();
  }

  private async init() {
    await this.openDB();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private async openDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Visibility change - sync when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }, this.options.syncInterval);
  }

  // Add item to sync queue
  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncItem: SyncItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.options.maxRetries
    };

    await this.saveToDB(syncItem);
    this.syncQueue.push(syncItem);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  // Process sync queue
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToSync = this.syncQueue.slice(0, this.options.batchSize);
    
    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        await this.removeFromDB(item.id);
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        await this.handleSyncError(item);
      }
    }
  }

  // Sync individual item
  private async syncItem(item: SyncItem): Promise<void> {
    switch (item.type) {
      case 'favorite':
        await this.syncFavorite(item.data);
        break;
      case 'cart':
        await this.syncCart(item.data);
        break;
      case 'form':
        await this.syncForm(item.data);
        break;
      case 'image':
        await this.syncImage(item.data);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  // Sync favorites
  private async syncFavorite(data: { eventId: string; action: 'add' | 'remove' }): Promise<void> {
    const response = await fetch('/api/favorites', {
      method: data.action === 'add' ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId: data.eventId })
    });

    if (!response.ok) {
      throw new Error(`Failed to sync favorite: ${response.statusText}`);
    }
  }

  // Sync cart
  private async syncCart(data: { items: any[] }): Promise<void> {
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync cart: ${response.statusText}`);
    }
  }

  // Sync form data
  private async syncForm(data: { formId: string; formData: any }): Promise<void> {
    const response = await fetch(`/api/forms/${data.formId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.formData)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync form: ${response.statusText}`);
    }
  }

  // Sync image upload
  private async syncImage(data: { imageId: string; imageData: string }): Promise<void> {
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync image: ${response.statusText}`);
    }
  }

  // Handle sync error
  private async handleSyncError(item: SyncItem): Promise<void> {
    item.retryCount++;
    
    if (item.retryCount >= item.maxRetries) {
      console.error('Max retries reached for item:', item.id);
      await this.removeFromDB(item.id);
      this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      return;
    }

    // Update retry count in DB
    await this.updateInDB(item);
    
    // Schedule retry
    setTimeout(() => {
      this.processSyncQueue();
    }, this.options.retryDelay);
  }

  // Database operations
  private async saveToDB(item: SyncItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.put(item);
  }

  private async removeFromDB(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.delete(id);
  }

  private async updateInDB(item: SyncItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.put(item);
  }

  // Load pending items from DB
  async loadPendingItems(): Promise<SyncItem[]> {
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        this.syncQueue = request.result;
        resolve(request.result);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean;
    queueLength: number;
    pendingItems: SyncItem[];
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      pendingItems: [...this.syncQueue]
    };
  }

  // Clear sync queue
  async clearSyncQueue(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.clear();
    this.syncQueue = [];
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Singleton instance
let syncManager: BackgroundSyncManager | null = null;

export function getBackgroundSyncManager(options?: SyncOptions): BackgroundSyncManager {
  if (!syncManager) {
    syncManager = new BackgroundSyncManager(options);
  }
  return syncManager;
}

// Convenience functions
export async function addFavoriteToSync(eventId: string, action: 'add' | 'remove'): Promise<void> {
  const manager = getBackgroundSyncManager();
  await manager.addToSyncQueue({
    type: 'favorite',
    data: { eventId, action }
  });
}

export async function addCartToSync(items: any[]): Promise<void> {
  const manager = getBackgroundSyncManager();
  await manager.addToSyncQueue({
    type: 'cart',
    data: { items }
  });
}

export async function addFormToSync(formId: string, formData: any): Promise<void> {
  const manager = getBackgroundSyncManager();
  await manager.addToSyncQueue({
    type: 'form',
    data: { formId, formData }
  });
}

export async function addImageToSync(imageId: string, imageData: string): Promise<void> {
  const manager = getBackgroundSyncManager();
  await manager.addToSyncQueue({
    type: 'image',
    data: { imageId, imageData }
  });
}

// Service Worker integration
export function registerBackgroundSync(): void {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register background sync for favorites
      registration.sync.register('background-sync-favorites');
      
      // Register background sync for cart
      registration.sync.register('background-sync-cart');
      
      // Register background sync for forms
      registration.sync.register('background-sync-forms');
      
      // Register background sync for images
      registration.sync.register('background-sync-images');
    });
  }
}
