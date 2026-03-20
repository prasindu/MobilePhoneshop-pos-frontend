import { openDB } from 'idb';

const DB_NAME = 'mobilehub-pos-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Offline product Table 
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      // Offline bill Table 
      if (!db.objectStoreNames.contains('offline_sales')) {
        db.createObjectStore('offline_sales', { keyPath: 'localId', autoIncrement: true });
      }
    },
  });
};

// 1. Products Local DB save (Online )
export const saveProductsOffline = async (products) => {
  const db = await initDB();
  const tx = db.transaction('products', 'readwrite');
  products.forEach(p => tx.store.put(p));
  await tx.done;
};

// 2. Products Local DB  (Offline )
export const getProductsOffline = async () => {
  const db = await initDB();
  return db.getAll('products');
};

// 3. bill Local DB save (Offline )
export const saveSaleOffline = async (saleData) => {
  const db = await initDB();
  return db.add('offline_sales', { ...saleData, savedAt: new Date().toISOString() });
};

// 4. Offline  (Sync )
export const getOfflineSales = async () => {
  const db = await initDB();
  return db.getAll('offline_sales');
};

// 5. Sync after Local DB remove
export const removeOfflineSale = async (localId) => {
  const db = await initDB();
  return db.delete('offline_sales', localId);
};