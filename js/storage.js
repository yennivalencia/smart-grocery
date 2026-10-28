/**
 * Storage Manager - Smart Grocery & Budget Safety Tracker
 * Mengelola persistensi data ke localStorage, sesi belanja, dan backup/restore.
 */

const STORAGE_KEYS = {
  CURRENT_CART: 'smart_grocery_current_cart',
  SETTINGS: 'smart_grocery_settings',
  PAST_SESSIONS: 'smart_grocery_sessions'
};

// Data Awal Realistis (Preset Belanja Siswa Rantau)
const DEFAULT_PRESET_ITEMS = [
  {
    id: 'item-1',
    name: 'Beras Rojolele Super 5kg',
    category: 'Makanan Pokok',
    unit: 'pack',
    qty: 1,
    unitPrice: 72500,
    lastMonthPrice: 75000, // Turun Rp 2.500 (Promo)
    discountFormula: '',
    inTrolley: true,
    note: 'Stok nasi sebulan'
  },
  {
    id: 'item-2',
    name: 'Telur Ayam Negeri',
    category: 'Makanan Pokok',
    unit: 'kg',
    qty: 1.5,
    unitPrice: 32000,
    lastMonthPrice: 28000, // Naik Rp 4.000 (Inflasi)
    discountFormula: '',
    inTrolley: true,
    note: 'Lauk protein utama kost'
  },
  {
    id: 'item-3',
    name: 'Minyak Goreng Sawit 2L',
    category: 'Bumbu & Masak',
    unit: 'liter',
    qty: 2,
    unitPrice: 36000,
    lastMonthPrice: 36000, // Stabil (=)
    discountFormula: '',
    inTrolley: true,
    note: 'Pouch kemasan refill'
  },
  {
    id: 'item-4',
    name: 'Indomie Goreng Spesial',
    category: 'Makanan Pokok',
    unit: 'pcs',
    qty: 10,
    unitPrice: 3100,
    lastMonthPrice: 3000, // Naik tipis
    discountFormula: '',
    inTrolley: true,
    note: 'Penyelamat akhir bulan'
  },
  {
    id: 'item-5',
    name: 'Deterjen Cair Konsentrat 750ml',
    category: 'Mandi & Cuci',
    unit: 'pack',
    qty: 1,
    unitPrice: 24500,
    lastMonthPrice: 26000,
    discountFormula: '20', // Diskon tunggal 20%
    inTrolley: false,
    note: 'Lagi promo diskon 20%'
  },
  {
    id: 'item-6',
    name: 'Biskuit Cokelat Kaleng',
    category: 'Minuman & Snack',
    unit: 'pack',
    qty: 1,
    unitPrice: 45000,
    lastMonthPrice: 42000,
    discountFormula: '50+20', // Promo Diskon Bertingkat 50% + 20%
    inTrolley: false,
    note: 'Promo supermarket 50% + 20%'
  }
];

// Contoh Riwayat Belanja Bulan Lalu (September 2026) untuk perbandingan data riwayat
const DEFAULT_PAST_SESSIONS = [
  {
    id: 'session-sep-2026',
    name: 'Belanja Bulanan Kost - September 2026',
    date: '2026-09-27T14:30:00.000Z',
    budgetCap: 400000,
    totalSpent: 384500,
    totalItems: 8,
    items: [
      { id: 'h-1', name: 'Beras Rojolele Super 5kg', category: 'Makanan Pokok', unit: 'pack', qty: 1, unitPrice: 75000, lastMonthPrice: 74000, finalSubtotal: 75000 },
      { id: 'h-2', name: 'Telur Ayam Negeri', category: 'Makanan Pokok', unit: 'kg', qty: 1, unitPrice: 28000, lastMonthPrice: 27500, finalSubtotal: 28000 },
      { id: 'h-3', name: 'Minyak Goreng Sawit 2L', category: 'Bumbu & Masak', unit: 'liter', qty: 2, unitPrice: 36000, lastMonthPrice: 36000, finalSubtotal: 72000 },
      { id: 'h-4', name: 'Deterjen Cair Konsentrat 750ml', category: 'Mandi & Cuci', unit: 'pack', qty: 1, unitPrice: 26000, lastMonthPrice: 25000, finalSubtotal: 26000 },
      { id: 'h-5', name: 'Sabun Mandi Cair 450ml', category: 'Mandi & Cuci', unit: 'pack', qty: 2, unitPrice: 21500, lastMonthPrice: 22000, finalSubtotal: 43000 },
      { id: 'h-6', name: 'Indomie Goreng Spesial', category: 'Makanan Pokok', unit: 'pcs', qty: 15, unitPrice: 3000, lastMonthPrice: 3000, finalSubtotal: 45000 },
      { id: 'h-7', name: 'Pasta Gigi Fresh 190g', category: 'Mandi & Cuci', unit: 'pcs', qty: 1, unitPrice: 16500, lastMonthPrice: 16000, finalSubtotal: 16500 },
      { id: 'h-8', name: 'Kopi Instan 10 Sachet', category: 'Minuman & Snack', unit: 'pack', qty: 4, unitPrice: 19500, lastMonthPrice: 19000, finalSubtotal: 78000 }
    ],
    note: 'Belanja hemat di Superindo dekat kampus.'
  }
];

const DEFAULT_SETTINGS = {
  budgetCap: 400000, // Rp 400.000 batas saku anak kost
  theme: 'dark',
  vibrationEnabled: true,
  autoSortBy: 'default' // default, category, price-desc, price-asc
};

const GroceryStorage = {
  /**
   * Mengambil keranjang belanja aktif
   */
  getCurrentCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_CART);
      if (!data) {
        this.saveCurrentCart(DEFAULT_PRESET_ITEMS);
        return DEFAULT_PRESET_ITEMS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Gagal membaca keranjang dari localStorage:', e);
      return DEFAULT_PRESET_ITEMS;
    }
  },

  /**
   * Menyimpan keranjang belanja aktif
   */
  saveCurrentCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CART, JSON.stringify(cart));
      return true;
    } catch (e) {
      console.error('Gagal menyimpan keranjang:', e);
      return false;
    }
  },

  /**
   * Mengambil preferensi dan batas anggaran
   */
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Menyimpan preferensi dan batas anggaran
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Mengambil seluruh riwayat sesi belanja masa lalu
   */
  getPastSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAST_SESSIONS);
      if (!data) {
        this.saveAllSessions(DEFAULT_PAST_SESSIONS);
        return DEFAULT_PAST_SESSIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_PAST_SESSIONS;
    }
  },

  /**
   * Simpan array sesi
   */
  saveAllSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEYS.PAST_SESSIONS, JSON.stringify(sessions));
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Simpan sesi keranjang saat ini sebagai riwayat transaksi resmi
   */
  saveCurrentAsSession(sessionName, note = '') {
    const cart = this.getCurrentCart();
    const settings = this.getSettings();
    if (!cart || cart.length === 0) {
      throw new Error('Keranjang belanja masih kosong!');
    }

    // Kalkulasi total
    let totalSpent = 0;
    const sessionItems = cart.map(item => {
      const calc = window.GroceryCalc.calculateItem(item);
      totalSpent += calc.finalSubtotal;
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        qty: item.qty,
        unitPrice: item.unitPrice,
        lastMonthPrice: item.lastMonthPrice,
        discountFormula: item.discountFormula,
        finalSubtotal: calc.finalSubtotal
      };
    });

    const newSession = {
      id: 'session-' + Date.now(),
      name: sessionName || `Belanja ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}`,
      date: new Date().toISOString(),
      budgetCap: settings.budgetCap,
      totalSpent,
      totalItems: sessionItems.length,
      items: sessionItems,
      note
    };

    const sessions = this.getPastSessions();
    sessions.unshift(newSession); // tambahkan di paling depan
    this.saveAllSessions(sessions);

    return newSession;
  },

  /**
   * Hapus sesi belanja
   */
  deleteSession(sessionId) {
    const sessions = this.getPastSessions().filter(s => s.id !== sessionId);
    this.saveAllSessions(sessions);
    return sessions;
  },

  /**
   * Jadikan sesi masa lalu sebagai acuan harga bulan lalu untuk item saat ini
   */
  applySessionAsBenchmark(sessionId) {
    const sessions = this.getPastSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return false;

    const currentCart = this.getCurrentCart();
    const benchmarkMap = {};

    session.items.forEach(item => {
      const normalizedName = item.name.toLowerCase().trim();
      benchmarkMap[normalizedName] = item.unitPrice;
    });

    // Update lastMonthPrice pada item keranjang saat ini
    let updatedCount = 0;
    const updatedCart = currentCart.map(item => {
      const matchPrice = benchmarkMap[item.name.toLowerCase().trim()];
      if (matchPrice !== undefined) {
        updatedCount++;
        return { ...item, lastMonthPrice: matchPrice };
      }
      return item;
    });

    this.saveCurrentCart(updatedCart);
    return { updatedCount, sessionName: session.name };
  },

  /**
   * Cari harga referensi dari riwayat terdahulu berdasarkan nama produk
   */
  findHistoricalPrice(productName) {
    if (!productName) return null;
    const cleanName = productName.toLowerCase().trim();
    const sessions = this.getPastSessions();

    for (const session of sessions) {
      const found = session.items?.find(it => it.name.toLowerCase().trim() === cleanName);
      if (found) {
        return found.unitPrice;
      }
    }
    return null;
  },

  /**
   * Export seluruh database ke JSON string
   */
  exportData() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      currentCart: this.getCurrentCart(),
      sessions: this.getPastSessions()
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data dari JSON string
   */
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.currentCart) this.saveCurrentCart(parsed.currentCart);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.sessions) this.saveAllSessions(parsed.sessions);
      return true;
    } catch (e) {
      console.error('Format JSON tidak valid:', e);
      return false;
    }
  },

  /**
   * Reset data ke kondisi bawaan
   */
  resetAll() {
    this.saveCurrentCart(DEFAULT_PRESET_ITEMS);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveAllSessions(DEFAULT_PAST_SESSIONS);
  }
};

// Export ke window scope
if (typeof window !== 'undefined') {
  window.GroceryStorage = GroceryStorage;
}

