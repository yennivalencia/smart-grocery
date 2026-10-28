/**
 * Calculator Engine - Smart Grocery & Budget Safety Tracker
 * Modul komputasi matematis untuk kuantitas, diskon bertingkat, komparasi harga, dan safety cap anggaran.
 */

const GroceryCalc = {
  /**
   * Format angka ke format mata uang Rupiah (IDR)
   * @param {number} num 
   * @param {boolean} withPrefix 
   * @returns {string}
   */
  formatRupiah(num, withPrefix = true) {
    if (isNaN(num) || num === null || num === undefined) {
      return withPrefix ? 'Rp 0' : '0';
    }
    const rounded = Math.round(num);
    const formatted = new Intl.NumberFormat('id-ID').format(Math.abs(rounded));
    const sign = rounded < 0 ? '-' : '';
    return withPrefix ? `${sign}Rp ${formatted}` : `${sign}${formatted}`;
  },

  /**
   * Parse input string angka/rupiah menjadi float
   * @param {string|number} val 
   * @returns {number}
   */
  parseNumber(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    // Hapus format seperti 'Rp', spasi, titik pemisah ribuan
    const clean = val.toString().replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  },

  /**
   * Parse & hitung diskon bertingkat (F-03)
   * Contoh input: "50+20", "25", "30% + 15%", "0", "50 + 20 + 10"
   * Rumus: P1 = P * (1 - d1/100), P2 = P1 * (1 - d2/100), dst.
   * @param {number} basePrice Total harga kotor (Qty * Harga Satuan)
   * @param {string|number} discountInput 
   * @returns {Object} Rincian diskon
   */
  calculateTieredDiscount(basePrice, discountInput) {
    const rawPrice = Math.max(0, Number(basePrice) || 0);
    if (!discountInput || rawPrice === 0) {
      return {
        rawPrice,
        finalPrice: rawPrice,
        discountAmount: 0,
        effectiveDiscountPercent: 0,
        tiers: [],
        formulaText: 'Tanpa diskon'
      };
    }

    // Bersihkan karakter selain angka, plus, titik, koma
    const str = discountInput.toString().replace(/%/g, '').trim();
    if (!str) {
      return {
        rawPrice,
        finalPrice: rawPrice,
        discountAmount: 0,
        effectiveDiscountPercent: 0,
        tiers: [],
        formulaText: 'Tanpa diskon'
      };
    }

    // Split berdasarkan tanda plus '+'
    const parts = str.split('+').map(p => parseFloat(p.trim().replace(',', '.'))).filter(n => !isNaN(n) && n > 0);

    if (parts.length === 0) {
      return {
        rawPrice,
        finalPrice: rawPrice,
        discountAmount: 0,
        effectiveDiscountPercent: 0,
        tiers: [],
        formulaText: 'Tanpa diskon'
      };
    }

    // Batasi setiap tier maksimal 100%
    const validTiers = parts.map(p => Math.min(100, Math.max(0, p)));

    // Kalkulasi bertingkat matematis
    let runningPrice = rawPrice;
    validTiers.forEach(tier => {
      const deduction = runningPrice * (tier / 100);
      runningPrice = Math.max(0, runningPrice - deduction);
    });

    const finalPrice = Math.round(runningPrice);
    const discountAmount = Math.max(0, rawPrice - finalPrice);
    const effectiveDiscountPercent = rawPrice > 0 
      ? Math.round(((discountAmount / rawPrice) * 100) * 10) / 10 
      : 0;

    let formulaText = '';
    if (validTiers.length === 1) {
      formulaText = `Diskon ${validTiers[0]}% (-${this.formatRupiah(discountAmount)})`;
    } else {
      formulaText = `Promo ${validTiers.join('% + ')}% (Efektif: ${effectiveDiscountPercent}%, Hemat ${this.formatRupiah(discountAmount)})`;
    }

    return {
      rawPrice,
      finalPrice,
      discountAmount,
      effectiveDiscountPercent,
      tiers: validTiers,
      formulaText
    };
  },

  /**
   * Hitung komparasi harga saat ini vs harga bulan lalu (F-04)
   * @param {number} currentUnitPrice Harga satuan saat ini
   * @param {number|null} lastMonthUnitPrice Harga satuan bulan lalu
   * @returns {Object} Status komparator dan selisih
   */
  comparePriceWithLastMonth(currentUnitPrice, lastMonthUnitPrice) {
    const cur = Math.max(0, Number(currentUnitPrice) || 0);
    const prev = lastMonthUnitPrice !== null && lastMonthUnitPrice !== undefined 
      ? Math.max(0, Number(lastMonthUnitPrice) || 0) 
      : null;

    if (prev === null || prev === 0) {
      return {
        status: 'none',
        diff: 0,
        diffPercent: 0,
        badgeText: 'Item Baru / Belum Ada Acuan',
        badgeColor: 'gray',
        icon: 'minus'
      };
    }

    const diff = cur - prev;
    const diffPercent = Math.round(((diff / prev) * 100) * 10) / 10;

    if (diff > 0) {
      return {
        status: 'up',
        diff,
        diffPercent,
        badgeText: `Naik ${this.formatRupiah(diff)} (+${diffPercent}%)`,
        badgeColor: 'rose',
        icon: 'trending-up',
        tooltip: `Lebih mahal Rp ${this.formatRupiah(diff, false)} dari bulan lalu (${this.formatRupiah(prev)})`
      };
    } else if (diff < 0) {
      const absDiff = Math.abs(diff);
      const absPercent = Math.abs(diffPercent);
      return {
        status: 'down',
        diff,
        diffPercent,
        badgeText: `Hemat ${this.formatRupiah(absDiff)} (-${absPercent}%)`,
        badgeColor: 'emerald',
        icon: 'trending-down',
        tooltip: `Lebih murah Rp ${this.formatRupiah(absDiff, false)} dari bulan lalu (${this.formatRupiah(prev)})`
      };
    } else {
      return {
        status: 'equal',
        diff: 0,
        diffPercent: 0,
        badgeText: 'Harga Stabil (=)',
        badgeColor: 'slate',
        icon: 'equal',
        tooltip: `Harga sama persis dengan bulan lalu (${this.formatRupiah(prev)})`
      };
    }
  },

  /**
   * Evaluasi status Safety Cap Anggaran Belanja (F-05)
   * @param {number} totalCart Total keranjang belanja saat ini
   * @param {number} budgetCap Batas maksimal uang saku/anggaran belanja
   * @returns {Object} Status anggaran, rasio, sisa, alert level
   */
  evaluateBudgetSafety(totalCart, budgetCap) {
    const cart = Math.max(0, Number(totalCart) || 0);
    const cap = Math.max(0, Number(budgetCap) || 0);

    if (cap === 0) {
      return {
        percentage: 0,
        remaining: 0,
        status: 'no_cap',
        label: 'Limit Belum Ditentukan',
        statusColor: 'slate',
        statusBg: 'bg-slate-800',
        progressColor: 'bg-emerald-500',
        isOverbudget: false,
        message: 'Tentukan batas anggaran untuk mengaktifkan Safety Cap Tracker.'
      };
    }

    const percentage = Math.min(200, Math.round((cart / cap) * 100));
    const rawPercentage = (cart / cap) * 100;
    const remaining = cap - cart;

    if (cart > cap) {
      const overBy = cart - cap;
      return {
        percentage,
        rawPercentage,
        remaining,
        status: 'overbudget',
        label: 'OVERBUDGET (BAHAYA!)',
        statusColor: 'rose',
        statusBg: 'bg-rose-950 border-rose-500/50 text-rose-300',
        progressColor: 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse',
        isOverbudget: true,
        message: `Waspada! Total keranjang melebihi batas dompet sebesar ${this.formatRupiah(overBy)}. Segera batalkan atau kurangi item opsional!`
      };
    } else if (rawPercentage >= 90) {
      return {
        percentage,
        rawPercentage,
        remaining,
        status: 'danger',
        label: 'SIAGA MERAH (Kritis)',
        statusColor: 'amber',
        statusBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
        progressColor: 'bg-gradient-to-r from-amber-500 to-rose-500',
        isOverbudget: false,
        message: `Sisa anggaran tinggal ${this.formatRupiah(remaining)} (${Math.round(100 - rawPercentage)}%). Batasi item tambahan non-esensial.`
      };
    } else if (rawPercentage >= 75) {
      return {
        percentage,
        rawPercentage,
        remaining,
        status: 'warning',
        label: 'WASPADA (Mendekati Limit)',
        statusColor: 'yellow',
        statusBg: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300',
        progressColor: 'bg-gradient-to-r from-emerald-500 to-yellow-500',
        isOverbudget: false,
        message: `Sudah terpakai ${percentage}%. Sisa uang saku belanja: ${this.formatRupiah(remaining)}.`
      };
    } else {
      return {
        percentage,
        rawPercentage,
        remaining,
        status: 'safe',
        label: 'AMAN (Terkendali)',
        statusColor: 'emerald',
        statusBg: 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300',
        progressColor: 'bg-gradient-to-r from-emerald-600 to-teal-400',
        isOverbudget: false,
        message: `Kondisi aman. Sisa anggaran belanja saat ini masih tersisa ${this.formatRupiah(remaining)}.`
      };
    }
  },

  /**
   * Hitung keseluruhan kalkulasi untuk satu baris item
   * @param {Object} item 
   * @returns {Object} Data item dengan kalkulasi lengkap
   */
  calculateItem(item) {
    const qty = Math.max(0.1, Number(item.qty) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const lastMonthPrice = item.lastMonthPrice !== undefined && item.lastMonthPrice !== null 
      ? Number(item.lastMonthPrice) 
      : null;

    const rawSubtotal = qty * unitPrice;
    const discountInfo = this.calculateTieredDiscount(rawSubtotal, item.discountFormula || '');
    const finalSubtotal = discountInfo.finalPrice;

    // Unit price setelah diskon baris
    const effectiveUnitPrice = qty > 0 ? (finalSubtotal / qty) : unitPrice;
    const comparison = this.comparePriceWithLastMonth(unitPrice, lastMonthPrice);

    return {
      ...item,
      qty,
      unitPrice,
      lastMonthPrice,
      rawSubtotal,
      finalSubtotal,
      discountInfo,
      effectiveUnitPrice,
      comparison
    };
  }
};

// Export ke browser window scope
if (typeof window !== 'undefined') {
  window.GroceryCalc = GroceryCalc;
}

