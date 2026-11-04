/**
 * Firebase Realtime Multi-Device Sync Engine
 * Smart Grocery & Budget Safety Tracker
 * 
 * Menggunakan listener realtime Cloud Firestore onSnapshot()
 * Sinkronisasi seketika antara HP (di supermarket) dan PC (di rumah) tanpa reload.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Deteksi perangkat (HP / PC)
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const currentDeviceLabel = isMobileDevice ? '📱 HP (Mobile)' : '💻 PC (Desktop)';
const currentDeviceId = 'dev_' + Math.random().toString(36).substring(2, 9);

let app = null;
let db = null;
let activeSessionUnsubscribe = null;
let isInitialized = false;
let isConnected = false;
let registeredCallbacks = {
  onRemoteData: null,
  onStatusChange: null
};

// Referensi Dokumen Sesi Aktif Bersama di Cloud Firestore
const COLLECTION_NAME = 'shopping_sessions';
const ACTIVE_DOC_ID = 'active_session';
const HISTORY_COLLECTION = 'shopping_history';

/**
 * Inisialisasi Firebase & Cloud Firestore
 */
async function initFirebaseSync(callbacks = {}) {
  registeredCallbacks = { ...registeredCallbacks, ...callbacks };

  try {
    updateStatus('connecting', 'Menghubungkan ke Cloud Firestore...');

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    // Aktifkan IndexedDB Offline Persistence untuk toleransi sinyal supermarket lemah
    try {
      await enableIndexedDbPersistence(db);
      console.log('Firebase offline persistence aktif.');
    } catch (persistErr) {
      if (persistErr.code === 'failed-precondition') {
        console.warn('Persistence gagal: Tab browser lain sedang terbuka.');
      } else if (persistErr.code === 'unimplemented') {
        console.warn('Browser tidak mendukung offline persistence.');
      }
    }

    // Mulai listener realtime onSnapshot()
    startRealtimeListener();

    // Pantau status online/offline jaringan browser
    window.addEventListener('online', () => {
      isConnected = true;
      updateStatus('online', 'Multi-Device Realtime Aktif');
    });

    window.addEventListener('offline', () => {
      isConnected = false;
      updateStatus('offline', 'Mode Offline (LocalStorage Aktif)');
    });

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Inisialisasi Firebase gagal, beralih penuh ke LocalStorage:', error);
    updateStatus('error', 'Gagal terhubung Cloud. Menggunakan LocalStorage.');
    return false;
  }
}

/**
 * PENTING: Listener Realtime onSnapshot()
 * JANGAN GUNAKAN getDoc() / getDocs() sekali baca!
 * Setiap ada perubahan data di HP atau PC, onSnapshot langsung terpicu otomatis.
 */
function startRealtimeListener() {
  if (!db) return;

  const docRef = doc(db, COLLECTION_NAME, ACTIVE_DOC_ID);

  // onSnapshot realtime stream
  activeSessionUnsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (docSnap) => {
      const hasPendingWrites = docSnap.metadata.hasPendingWrites;
      const isFromCache = docSnap.metadata.fromCache;

      if (!isFromCache) {
        isConnected = true;
        updateStatus('online', 'Multi-Device Realtime Aktif');
      }

      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        const isFromOtherDevice = remoteData.lastModifiedDeviceId && remoteData.lastModifiedDeviceId !== currentDeviceId;

        if (typeof registeredCallbacks.onRemoteData === 'function') {
          registeredCallbacks.onRemoteData(remoteData, {
            isLocalWrite: hasPendingWrites,
            isFromOtherDevice,
            deviceLabel: remoteData.lastModifiedBy || 'Perangkat Lain',
            timestamp: remoteData.updatedAt
          });
        }
      } else {
        // Dokumen active_session belum ada di cloud (pertama kali dibuat)
        // Kita seed otomatis dari data lokal yang sudah ada di LocalStorage
        console.log('Dokumen active_session belum ada di cloud. Menyiapkan inisialisasi awal...');
        if (typeof registeredCallbacks.onEmptyCloud === 'function') {
          registeredCallbacks.onEmptyCloud();
        }
      }
    },
    (error) => {
      console.warn('Listener onSnapshot mengalami gangguan:', error);
      isConnected = false;
      updateStatus('offline', 'Koneksi terputus. Menggunakan data lokal (LocalStorage).');
    }
  );
}

/**
 * Kirim Perubahan Sesi Belanja ke Cloud Firestore
 * Dipanggil setiap kali user menambah/mengubah barang, kuantitas, harga, atau anggaran.
 * 
 * Parameter yang wajib disimpan:
 * - storeLocation (string)
 * - shoppingDate (string)
 * - walletLimit (number)
 * - items (array)
 * - totalSpent (number)
 * - sessionName (string)
 * - status (string)
 */
async function pushSessionToCloud(sessionPayload) {
  if (!db) {
    console.warn('Firestore belum diinisialisasi. Perubahan tetap aman di LocalStorage.');
    return false;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, ACTIVE_DOC_ID);

    const dataToSave = {
      storeLocation: sessionPayload.storeLocation || 'Supermarket',
      shoppingDate: sessionPayload.shoppingDate || new Date().toISOString().slice(0, 10),
      walletLimit: Number(sessionPayload.walletLimit) || 0,
      items: Array.isArray(sessionPayload.items) ? sessionPayload.items : [],
      totalSpent: Number(sessionPayload.totalSpent) || 0,
      sessionName: sessionPayload.sessionName || 'Belanja Bulanan',
      status: sessionPayload.status || 'active',
      lastModifiedBy: currentDeviceLabel,
      lastModifiedDeviceId: currentDeviceId,
      updatedAt: new Date().toISOString()
    };

    // setDoc dengan merge: true agar atomic dan aman
    await setDoc(docRef, dataToSave, { merge: true });
    return true;
  } catch (err) {
    console.error('Gagal mengirim update ke Cloud Firestore:', err);
    // Data tetap aman di LocalStorage!
    return false;
  }
}

/**
 * Simpan Sesi Selesai ke Koleksi Riwayat di Cloud
 */
async function pushCompletedSessionToHistory(completedSession) {
  if (!db) return false;
  try {
    const historyDocId = completedSession.id || ('session_' + Date.now());
    const docRef = doc(db, HISTORY_COLLECTION, historyDocId);
    await setDoc(docRef, {
      ...completedSession,
      savedFromDevice: currentDeviceLabel,
      savedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Gagal menyimpan sesi ke riwayat cloud:', err);
    return false;
  }
}

/**
 * Update Status UI Sync
 */
function updateStatus(status, message) {
  if (typeof registeredCallbacks.onStatusChange === 'function') {
    registeredCallbacks.onStatusChange(status, message, currentDeviceLabel);
  }
}

// Global Export untuk dihubungkan dengan js/app.js dan js/storage.js
window.FirebaseSync = {
  init: initFirebaseSync,
  pushSession: pushSessionToCloud,
  pushHistory: pushCompletedSessionToHistory,
  getDeviceLabel: () => currentDeviceLabel,
  getDeviceId: () => currentDeviceId,
  isConnected: () => isConnected
};

// Dispatch custom event bahwa FirebaseSync engine telah siap di browser
window.dispatchEvent(new CustomEvent('FirebaseSyncReady'));

