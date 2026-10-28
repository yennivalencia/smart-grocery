/**
 * Smart Grocery & Budget Safety Tracker - Core Application Controller
 * Menghubungkan seluruh modul kalkulator, penyimpanan lokal, dan interaksi Mobile UI/UX.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    cart: [],
    settings: {},
    sessions: [],
    activeTab: 'tabCart',
    selectedCategory: 'ALL',
    searchQuery: '',
    editingItemId: null
  };

  // DOM Elements Cache
  const DOM = {
    // Header & Safety Cap
    headerCartTotal: document.getElementById('headerCartTotal'),
    safetyCapWidget: document.getElementById('safetyCapWidget'),
    safetyStatusDot: document.getElementById('safetyStatusDot'),
    safetyStatusLabel: document.getElementById('safetyStatusLabel'),
    safetyCapBudgetDisplay: document.getElementById('safetyCapBudgetDisplay'),
    safetyProgressBar: document.getElementById('safetyProgressBar'),
    safetySpentText: document.getElementById('safetySpentText'),
    safetyRemainingText: document.getElementById('safetyRemainingText'),
    safetyAlertBanner: document.getElementById('safetyAlertBanner'),
    safetyAlertIcon: document.getElementById('safetyAlertIcon'),
    safetyAlertMsg: document.getElementById('safetyAlertMsg'),

    // Sticky Summary
    stickySummaryBar: document.getElementById('stickySummaryBar'),
    stickyCartTotal: document.getElementById('stickyCartTotal'),
    stickyItemCount: document.getElementById('stickyItemCount'),
    btnCheckoutFloat: document.getElementById('btnCheckoutFloat'),

    // Navigation
    navTabs: document.querySelectorAll('.nav-tab-btn'),
    navCartBadge: document.getElementById('navCartBadge'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    // Cart Section
    cartItemsContainer: document.getElementById('cartItemsContainer'),
    emptyCartView: document.getElementById('emptyCartView'),
    cartSearchInput: document.getElementById('cartSearchInput'),
    categoryFilterChips: document.querySelectorAll('.cat-filter-chip'),
    countAllItems: document.getElementById('countAllItems'),
    statInTrolley: document.getElementById('statInTrolley'),
    statTotalItems: document.getElementById('statTotalItems'),
    statTotalSaved: document.getElementById('statTotalSaved'),
    btnQuickAddProduct: document.getElementById('btnQuickAddProduct'),
    btnLoadDefaultPreset: document.getElementById('btnLoadDefaultPreset'),
    btnQuickReset: document.getElementById('btnQuickReset'),
    btnOpenSaveSession: document.getElementById('btnOpenSaveSession'),

    // History Section
    tabHistory: document.getElementById('tabHistory'),
    historySessionsContainer: document.getElementById('historySessionsContainer'),
    emptyHistoryView: document.getElementById('emptyHistoryView'),
    historySessionCount: document.getElementById('historySessionCount'),
    btnExportData: document.getElementById('btnExportData'),
    btnImportDataTrigger: document.getElementById('btnImportDataTrigger'),
    importFileInput: document.getElementById('importFileInput'),

    // Budget Section
    tabBudget: document.getElementById('tabBudget'),
    inputBudgetCap: document.getElementById('inputBudgetCap'),
    budgetPresetBtns: document.querySelectorAll('.budget-preset-btn'),
    categoryBreakdownContainer: document.getElementById('categoryBreakdownContainer'),
    budgetTotalItemsCount: document.getElementById('budgetTotalItemsCount'),

    // Modal Item Form
    modalItemForm: document.getElementById('modalItemForm'),
    modalItemBackdrop: document.getElementById('modalItemBackdrop'),
    modalItemTitle: document.getElementById('modalItemTitle'),
    btnCloseItemModal: document.getElementById('btnCloseItemModal'),
    btnCancelItemForm: document.getElementById('btnCancelItemForm'),
    itemForm: document.getElementById('itemForm'),
    formItemId: document.getElementById('formItemId'),
    formItemName: document.getElementById('formItemName'),
    formItemCategory: document.getElementById('formItemCategory'),
    formItemUnit: document.getElementById('formItemUnit'),
    formItemQty: document.getElementById('formItemQty'),
    btnQtyMinus: document.getElementById('btnQtyMinus'),
    btnQtyPlus: document.getElementById('btnQtyPlus'),
    formItemPrice: document.getElementById('formItemPrice'),
    formLiveSubtotalPreview: document.getElementById('formLiveSubtotalPreview'),
    formItemLastMonthPrice: document.getElementById('formItemLastMonthPrice'),
    formHistoricalTag: document.getElementById('formHistoricalTag'),
    formComparePreview: document.getElementById('formComparePreview'),
    formItemDiscount: document.getElementById('formItemDiscount'),
    formDiscountPreviewText: document.getElementById('formDiscountPreviewText'),
    btnSubmitItemForm: document.getElementById('btnSubmitItemForm'),
    btnSubmitItemLabel: document.getElementById('btnSubmitItemLabel'),
    quickNameChips: document.querySelectorAll('.quick-name-chip'),
    quickDiscountChips: document.querySelectorAll('.quick-discount-chip'),

    // Modal Save Session
    modalSaveSession: document.getElementById('modalSaveSession'),
    modalSaveSessionBackdrop: document.getElementById('modalSaveSessionBackdrop'),
    btnCloseSaveSessionModal: document.getElementById('btnCloseSaveSessionModal'),
    btnCancelSaveSession: document.getElementById('btnCancelSaveSession'),
    btnConfirmSaveSession: document.getElementById('btnConfirmSaveSession'),
    inputSessionName: document.getElementById('inputSessionName'),
    inputSessionNote: document.getElementById('inputSessionNote'),
    modalSummaryTotal: document.getElementById('modalSummaryTotal'),
    modalSummaryItems: document.getElementById('modalSummaryItems'),
    modalSummaryStatus: document.getElementById('modalSummaryStatus'),

    // Modal History Detail
    modalHistoryDetail: document.getElementById('modalHistoryDetail'),
    modalHistoryDetailBackdrop: document.getElementById('modalHistoryDetailBackdrop'),
    btnCloseHistoryDetail: document.getElementById('btnCloseHistoryDetail'),
    historyDetailTitle: document.getElementById('historyDetailTitle'),
    historyDetailDate: document.getElementById('historyDetailDate'),
    historyDetailItemsContainer: document.getElementById('historyDetailItemsContainer'),
    btnApplyAsBenchmarkFromModal: document.getElementById('btnApplyAsBenchmarkFromModal'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Refresh Lucide Icons safely
   */
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * Haptic vibration feedback
   */
  function triggerHaptic(type = 'light') {
    if ('vibrate' in navigator) {
      if (type === 'light') navigator.vibrate(12);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'warning') navigator.vibrate([30, 40, 30]);
    }
  }

  /**
   * Tampilkan Toast Notification Ramah Jempol
   */
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-950 border-emerald-500/50 text-emerald-200',
      warning: 'bg-amber-950 border-amber-500/50 text-amber-200',
      danger: 'bg-rose-950 border-rose-500/50 text-rose-200',
      info: 'bg-slate-900 border-white/20 text-slate-200'
    };

    const icons = {
      success: 'check-circle-2',
      warning: 'alert-triangle',
      danger: 'alert-octagon',
      info: 'info'
    };

    toast.className = `p-3 rounded-2xl border shadow-xl flex items-center space-x-2.5 text-xs transition-all duration-300 transform -translate-y-2 opacity-0 pointer-events-auto ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
      <span class="flex-1 font-medium leading-tight">${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);
    refreshIcons();

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Inisialisasi Aplikasi
   */
  function init() {
    state.cart = window.GroceryStorage.getCurrentCart();
    state.settings = window.GroceryStorage.getSettings();
    state.sessions = window.GroceryStorage.getPastSessions();

    bindEvents();
    renderAll();

    // Check URL queries (misal shortcut PWA ?tab=budget)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'budget') {
      switchTab('tabBudget');
    } else if (tabParam === 'history') {
      switchTab('tabHistory');
    }
    if (urlParams.get('action') === 'add') {
      openItemModal();
    }
  }

  /**
   * Bind Seluruh Event Listener
   */
  function bindEvents() {
    // Navigasi Bawah
    DOM.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        switchTab(target);
      });
    });

    // Search Keranjang Belanja
    DOM.cartSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderCartList();
    });

    // Kategori Filter Chips
    DOM.categoryFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.categoryFilterChips.forEach(c => {
          c.classList.remove('active', 'bg-emerald-600', 'text-white');
          c.classList.add('bg-slate-900', 'text-slate-300');
        });
        chip.classList.add('active', 'bg-emerald-600', 'text-white');
        chip.classList.remove('bg-slate-900', 'text-slate-300');

        state.selectedCategory = chip.getAttribute('data-category');
        renderCartList();
      });
    });

    // Tombol Tambah Item Baru
    DOM.btnQuickAddProduct.addEventListener('click', () => openItemModal());
    DOM.btnLoadDefaultPreset.addEventListener('click', () => {
      state.cart = window.GroceryStorage.getCurrentCart();
      window.GroceryStorage.resetAll();
      state.cart = window.GroceryStorage.getCurrentCart();
      renderAll();
      showToast('Paket belanja siswa rantau berhasil dimuat ulang!', 'success');
    });

    // Tombol Reset Keranjang
    DOM.btnQuickReset.addEventListener('click', () => {
      if (confirm('Kosongkan keranjang belanja saat ini?')) {
        state.cart = [];
        window.GroceryStorage.saveCurrentCart([]);
        renderAll();
        showToast('Keranjang telah dikosongkan.', 'info');
      }
    });

    // Stepper di dalam Modal Form Item
    DOM.btnQtyMinus.addEventListener('click', () => {
      let val = parseFloat(DOM.formItemQty.value) || 1;
      val = Math.max(0.1, Math.round((val - (val > 1 ? 1 : 0.5)) * 10) / 10);
      DOM.formItemQty.value = val;
      updateFormPreview();
      triggerHaptic('light');
    });

    DOM.btnQtyPlus.addEventListener('click', () => {
      let val = parseFloat(DOM.formItemQty.value) || 1;
      val = Math.round((val + (val >= 1 ? 1 : 0.5)) * 10) / 10;
      DOM.formItemQty.value = val;
      updateFormPreview();
      triggerHaptic('light');
    });

    DOM.formItemQty.addEventListener('input', updateFormPreview);

    // Live formatting dan update saat input harga satuan
    DOM.formItemPrice.addEventListener('input', (e) => {
      const num = window.GroceryCalc.parseNumber(e.target.value);
      if (num > 0 && e.target.value.length > 3) {
        // format rapi ribuan
        const cursorEnd = e.target.selectionEnd;
        e.target.value = new Intl.NumberFormat('id-ID').format(num);
      }
      updateFormPreview();
    });

    // Live update saat input harga bulan lalu
    DOM.formItemLastMonthPrice.addEventListener('input', (e) => {
      const num = window.GroceryCalc.parseNumber(e.target.value);
      if (num > 0 && e.target.value.length > 3) {
        e.target.value = new Intl.NumberFormat('id-ID').format(num);
      }
      updateFormPreview();
    });

    // Live update saat input diskon bertingkat
    DOM.formItemDiscount.addEventListener('input', updateFormPreview);

    // Preset Diskon Chips
    DOM.quickDiscountChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.formItemDiscount.value = chip.getAttribute('data-val');
        updateFormPreview();
        triggerHaptic('light');
      });
    });

    // Preset Nama Produk Cepat
    DOM.quickNameChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.formItemName.value = chip.getAttribute('data-name');
        DOM.formItemCategory.value = chip.getAttribute('data-cat');
        DOM.formItemUnit.value = chip.getAttribute('data-unit');
        const price = chip.getAttribute('data-price');
        DOM.formItemPrice.value = new Intl.NumberFormat('id-ID').format(price);

        // Auto-detect harga masa lalu jika ada di riwayat
        checkHistoricalPrice(DOM.formItemName.value);
        updateFormPreview();
        triggerHaptic('light');
      });
    });

    // Nama produk berubah -> auto-detect histori
    DOM.formItemName.addEventListener('blur', () => {
      checkHistoricalPrice(DOM.formItemName.value);
    });

    // Submit Form Item (F-01 s/d F-04)
    DOM.itemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveItemFromForm();
    });
    DOM.btnCloseItemModal.addEventListener('click', closeItemModal);
    DOM.btnCancelItemForm.addEventListener('click', closeItemModal);
    DOM.modalItemBackdrop.addEventListener('click', closeItemModal);

    // Modal Selesai Belanja / Simpan Sesi (F-06)
    DOM.btnOpenSaveSession.addEventListener('click', openSaveSessionModal);
    DOM.btnCheckoutFloat.addEventListener('click', openSaveSessionModal);
    DOM.btnCloseSaveSessionModal.addEventListener('click', closeSaveSessionModal);
    DOM.btnCancelSaveSession.addEventListener('click', closeSaveSessionModal);
    DOM.modalSaveSessionBackdrop.addEventListener('click', closeSaveSessionModal);
    DOM.btnConfirmSaveSession.addEventListener('click', confirmSaveSession);

    // Modal Riwayat Detail
    DOM.btnCloseHistoryDetail.addEventListener('click', closeHistoryDetailModal);
    DOM.modalHistoryDetailBackdrop.addEventListener('click', closeHistoryDetailModal);

    // Edit Budget Cap (F-05)
    DOM.inputBudgetCap.addEventListener('change', (e) => {
      const val = window.GroceryCalc.parseNumber(e.target.value);
      if (val >= 0) {
        state.settings.budgetCap = val;
        window.GroceryStorage.saveSettings(state.settings);
        renderBudgetWidget();
        renderBudgetTab();
        showToast(`Batas belanja diperbarui: ${window.GroceryCalc.formatRupiah(val)}`, 'success');
      }
    });

    // Budget Quick Presets
    DOM.budgetPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.getAttribute('data-amount'), 10);
        state.settings.budgetCap = amount;
        DOM.inputBudgetCap.value = new Intl.NumberFormat('id-ID').format(amount);
        window.GroceryStorage.saveSettings(state.settings);
        renderBudgetWidget();
        renderBudgetTab();
        triggerHaptic('light');
        showToast(`Batas belanja diset ke ${window.GroceryCalc.formatRupiah(amount)}`, 'success');
      });
    });

    // Export / Import Backup Data
    DOM.btnExportData.addEventListener('click', () => {
      const jsonStr = window.GroceryStorage.exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-grocery-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data berhasil diekspor ke file JSON', 'success');
    });

    DOM.btnImportDataTrigger.addEventListener('click', () => {
      DOM.importFileInput.click();
    });

    DOM.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = window.GroceryStorage.importData(event.target.result);
        if (success) {
          state.cart = window.GroceryStorage.getCurrentCart();
          state.settings = window.GroceryStorage.getSettings();
          state.sessions = window.GroceryStorage.getPastSessions();
          renderAll();
          showToast('Data berhasil diimpor dengan sukses!', 'success');
        } else {
          showToast('Gagal mengimpor file. Format tidak cocok.', 'danger');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });
  }

  /**
   * Cek harga referensi dari riwayat terdahulu jika ada
   */
  function checkHistoricalPrice(name) {
    if (!name) return;
    const histPrice = window.GroceryStorage.findHistoricalPrice(name);
    if (histPrice && (!DOM.formItemLastMonthPrice.value || DOM.formItemLastMonthPrice.value === '0')) {
      DOM.formItemLastMonthPrice.value = new Intl.NumberFormat('id-ID').format(histPrice);
      DOM.formHistoricalTag.textContent = `(Ditemukan dari riwayat: Rp ${new Intl.NumberFormat('id-ID').format(histPrice)})`;
      updateFormPreview();
    } else if (!histPrice) {
      DOM.formHistoricalTag.textContent = '';
    }
  }

  /**
   * Switch Active Tab
   */
  function switchTab(targetTabId) {
    state.activeTab = targetTabId;

    // Update Bottom Nav Styling
    DOM.navTabs.forEach(tab => {
      const isTarget = tab.getAttribute('data-target') === targetTabId;
      if (isTarget) {
        tab.classList.add('text-emerald-400');
        tab.classList.remove('text-slate-400');
      } else {
        tab.classList.remove('text-emerald-400');
        tab.classList.add('text-slate-400');
      }
    });

    // Update Tab Panes
    DOM.tabPanes.forEach(pane => {
      if (pane.id === targetTabId) {
        pane.classList.remove('hidden');
        pane.classList.add('active');
      } else {
        pane.classList.add('hidden');
        pane.classList.remove('active');
      }
    });

    if (targetTabId === 'tabHistory') {
      renderHistoryTab();
    } else if (targetTabId === 'tabBudget') {
      renderBudgetTab();
    }

    refreshIcons();
    triggerHaptic('light');
  }

  /**
   * Render Keseluruhan Komponen
   */
  function renderAll() {
    renderCartList();
    renderBudgetWidget();
    renderStickyBar();
    renderHistoryTab();
    renderBudgetTab();
  }

  /**
   * Render List Item Belanja (Keranjang) - Format Card Vertikal Ergonomis
   */
  function renderCartList() {
    DOM.cartItemsContainer.innerHTML = '';

    // Filter berdasarkan Kategori & Search
    let items = state.cart;
    if (state.selectedCategory !== 'ALL') {
      items = items.filter(it => it.category === state.selectedCategory);
    }
    if (state.searchQuery) {
      items = items.filter(it => 
        it.name.toLowerCase().includes(state.searchQuery) ||
        (it.category && it.category.toLowerCase().includes(state.searchQuery)) ||
        (it.note && it.note.toLowerCase().includes(state.searchQuery))
      );
    }

    DOM.countAllItems.textContent = state.cart.length;

    if (items.length === 0) {
      DOM.emptyCartView.classList.remove('hidden');
    } else {
      DOM.emptyCartView.classList.add('hidden');
    }

    let inTrolleyCount = 0;
    let totalSavings = 0;

    items.forEach((rawItem) => {
      const item = window.GroceryCalc.calculateItem(rawItem);
      if (item.inTrolley) inTrolleyCount++;
      totalSavings += item.discountInfo.discountAmount;

      const card = document.createElement('div');
      const inTrolleyClass = item.inTrolley ? 'in-trolley' : 'out-trolley';

      // Komparator Badge F-04
      let compBadgeHtml = '';
      if (item.comparison.status === 'up') {
        compBadgeHtml = `
          <span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md badge-up">
            <i data-lucide="trending-up" class="w-3 h-3 text-rose-400"></i>
            ${item.comparison.badgeText}
          </span>
        `;
      } else if (item.comparison.status === 'down') {
        compBadgeHtml = `
          <span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md badge-down">
            <i data-lucide="trending-down" class="w-3 h-3 text-emerald-400"></i>
            ${item.comparison.badgeText}
          </span>
        `;
      } else if (item.comparison.status === 'equal') {
        compBadgeHtml = `
          <span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md badge-equal">
            <i data-lucide="equal" class="w-3 h-3 text-slate-300"></i>
            Stabil
          </span>
        `;
      }

      // Diskon Badge F-03
      let discountBadgeHtml = '';
      if (item.discountInfo.effectiveDiscountPercent > 0) {
        discountBadgeHtml = `
          <span class="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <i data-lucide="percent" class="w-2.5 h-2.5"></i>
            ${item.discountInfo.formulaText}
          </span>
        `;
      }

      card.className = `cart-item-card p-3 rounded-2xl bg-slate-900 border transition-all ${inTrolleyClass}`;
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <!-- Checkbox Troli & Info Utama -->
          <div class="flex items-start space-x-2.5 flex-1 min-w-0">
            <!-- Custom Trolley Checkbox -->
            <button class="btn-toggle-trolley touch-btn mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition ${item.inTrolley ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-white/20 text-transparent'}" data-id="${item.id}" title="${item.inTrolley ? 'Sudah masuk troli' : 'Tandai masuk troli'}">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </button>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h4 class="text-xs font-bold text-white tracking-tight truncate ${item.inTrolley ? '' : 'text-slate-300'}">${item.name}</h4>
                <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-white/5">${item.category}</span>
              </div>

              <!-- Price Per Unit & Reference -->
              <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                <span>${window.GroceryCalc.formatRupiah(item.unitPrice)} / ${item.unit}</span>
                ${item.lastMonthPrice ? `<span class="text-slate-500 text-[10px] line-through">Lalu: ${window.GroceryCalc.formatRupiah(item.lastMonthPrice)}</span>` : ''}
              </div>

              <!-- Badges Container (F-03 & F-04) -->
              <div class="flex items-center gap-1.5 flex-wrap mt-1.5">
                ${compBadgeHtml}
                ${discountBadgeHtml}
              </div>
            </div>
          </div>

          <!-- Subtotal & Actions -->
          <div class="text-right flex flex-col items-end flex-shrink-0">
            <!-- Subtotal Akhir Realtime (F-02) -->
            <div class="text-xs font-black text-white">
              ${window.GroceryCalc.formatRupiah(item.finalSubtotal)}
            </div>
            ${item.discountInfo.discountAmount > 0 ? `
              <div class="text-[9px] text-slate-500 line-through">
                ${window.GroceryCalc.formatRupiah(item.rawSubtotal)}
              </div>
            ` : ''}

            <!-- Action buttons (Edit & Delete) -->
            <div class="flex items-center space-x-1 mt-2">
              <button class="btn-edit-item touch-btn p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" data-id="${item.id}" title="Edit Item">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              <button class="btn-delete-item touch-btn p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/50" data-id="${item.id}" title="Hapus Item">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- F-02: Interactive Stepper Bar (Ramah Jempol) -->
        <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
          <div class="text-[10px] text-slate-400">
            ${item.note ? `<span class="italic truncate max-w-[180px] inline-block">"${item.note}"</span>` : 'Kuantitas beli:'}
          </div>

          <div class="flex items-center space-x-2">
            <button class="btn-stepper-minus stepper-btn touch-btn text-xs font-bold" data-id="${item.id}">-</button>
            <span class="text-xs font-extrabold text-white w-10 text-center">${item.qty} ${item.unit}</span>
            <button class="btn-stepper-plus stepper-btn touch-btn text-xs font-bold" data-id="${item.id}">+</button>
          </div>
        </div>
      `;

      DOM.cartItemsContainer.appendChild(card);
    });

    // Update Stats
    DOM.statInTrolley.textContent = inTrolleyCount;
    DOM.statTotalItems.textContent = state.cart.length;
    DOM.statTotalSaved.textContent = window.GroceryCalc.formatRupiah(totalSavings);
    DOM.navCartBadge.textContent = state.cart.length;

    // Attach row events
    attachCartRowEvents();
    refreshIcons();
  }

  /**
   * Event Listener Baris Item Keranjang
   */
  function attachCartRowEvents() {
    // Toggle Trolley Status
    document.querySelectorAll('.btn-toggle-trolley').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = state.cart.find(it => it.id === id);
        if (item) {
          item.inTrolley = !item.inTrolley;
          saveAndRefreshCart();
          triggerHaptic('light');
        }
      });
    });

    // Stepper Minus (F-02 Realtime)
    document.querySelectorAll('.btn-stepper-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = state.cart.find(it => it.id === id);
        if (item) {
          if (item.qty > 1) {
            item.qty = Math.round((item.qty - 1) * 10) / 10;
          } else if (item.qty > 0.1) {
            item.qty = Math.round((item.qty - 0.1) * 10) / 10;
          } else {
            return;
          }
          saveAndRefreshCart();
          triggerHaptic('light');
        }
      });
    });

    // Stepper Plus (F-02 Realtime)
    document.querySelectorAll('.btn-stepper-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = state.cart.find(it => it.id === id);
        if (item) {
          item.qty = Math.round((item.qty + 1) * 10) / 10;
          saveAndRefreshCart();
          triggerHaptic('light');
        }
      });
    });

    // Edit Item
    document.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = state.cart.find(it => it.id === id);
        if (item) {
          openItemModal(item);
        }
      });
    });

    // Hapus Item
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = state.cart.find(it => it.id === id);
        if (confirm(`Hapus "${item?.name}" dari troli?`)) {
          state.cart = state.cart.filter(it => it.id !== id);
          saveAndRefreshCart();
          showToast(`Item "${item?.name}" dihapus.`, 'info');
        }
      });
    });
  }

  /**
   * Simpan dan Render Ulang Keranjang
   */
  function saveAndRefreshCart() {
    window.GroceryStorage.saveCurrentCart(state.cart);
    renderCartList();
    renderBudgetWidget();
    renderStickyBar();
    renderBudgetTab();
  }

  /**
   * Render Widget Pengendali Anggaran (F-05 Safety Cap)
   */
  function renderBudgetWidget() {
    let totalCart = 0;
    state.cart.forEach(raw => {
      const item = window.GroceryCalc.calculateItem(raw);
      totalCart += item.finalSubtotal;
    });

    const budgetCap = state.settings.budgetCap || 400000;
    const safety = window.GroceryCalc.evaluateBudgetSafety(totalCart, budgetCap);

    // Header values
    DOM.headerCartTotal.textContent = window.GroceryCalc.formatRupiah(totalCart);
    DOM.safetyCapBudgetDisplay.textContent = window.GroceryCalc.formatRupiah(budgetCap);
    DOM.safetyStatusLabel.textContent = `${safety.label} (${safety.percentage}%)`;
    DOM.safetyProgressBar.style.width = `${Math.min(100, safety.percentage)}%`;

    // Dynamic Class colors
    DOM.safetyProgressBar.className = `h-full rounded-full transition-all duration-300 ${safety.progressColor}`;

    if (safety.isOverbudget) {
      DOM.safetyStatusDot.className = 'w-2 h-2 rounded-full bg-rose-500 animate-ping';
      DOM.safetyStatusLabel.className = 'font-black text-rose-400 tracking-wide text-[11px] uppercase';
      DOM.safetyRemainingText.textContent = `Minus: ${window.GroceryCalc.formatRupiah(Math.abs(safety.remaining))}`;
      DOM.safetyRemainingText.className = 'text-rose-400 font-extrabold';

      // Show alert banner
      DOM.safetyAlertBanner.classList.remove('hidden');
      DOM.safetyAlertBanner.className = 'mt-2 p-2.5 rounded-xl text-xs flex items-start gap-2 border bg-rose-950/80 border-rose-500/50 text-rose-300 budget-pulse-danger';
      DOM.safetyAlertMsg.innerHTML = `<strong>BAHAYA OVERBUDGET!</strong> Total belanja melebihi uang tunai sebesar <strong>${window.GroceryCalc.formatRupiah(Math.abs(safety.remaining))}</strong>. Mohon keluarkan barang yang belum penting!`;
      triggerHaptic('warning');
    } else if (safety.status === 'danger') {
      DOM.safetyStatusDot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-ping';
      DOM.safetyStatusLabel.className = 'font-bold text-amber-400 tracking-wide text-[11px] uppercase';
      DOM.safetyRemainingText.textContent = `Sisa: ${window.GroceryCalc.formatRupiah(safety.remaining)}`;
      DOM.safetyRemainingText.className = 'text-amber-400 font-bold';

      DOM.safetyAlertBanner.classList.remove('hidden');
      DOM.safetyAlertBanner.className = 'mt-2 p-2 rounded-xl text-xs flex items-start gap-2 border bg-amber-950/80 border-amber-500/50 text-amber-300';
      DOM.safetyAlertMsg.innerHTML = `<strong>Kritis!</strong> Sisa saku tinggal ${window.GroceryCalc.formatRupiah(safety.remaining)}. Prioritaskan barang di troli.`;
    } else if (safety.status === 'warning') {
      DOM.safetyStatusDot.className = 'w-2 h-2 rounded-full bg-yellow-400';
      DOM.safetyStatusLabel.className = 'font-bold text-yellow-400 tracking-wide text-[11px] uppercase';
      DOM.safetyRemainingText.textContent = `Sisa: ${window.GroceryCalc.formatRupiah(safety.remaining)}`;
      DOM.safetyRemainingText.className = 'text-yellow-300 font-semibold';
      DOM.safetyAlertBanner.classList.add('hidden');
    } else {
      DOM.safetyStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      DOM.safetyStatusLabel.className = 'font-bold text-emerald-400 tracking-wide text-[11px] uppercase';
      DOM.safetyRemainingText.textContent = `Sisa: ${window.GroceryCalc.formatRupiah(safety.remaining)}`;
      DOM.safetyRemainingText.className = 'text-emerald-300 font-semibold';
      DOM.safetyAlertBanner.classList.add('hidden');
    }

    refreshIcons();
  }

  /**
   * Render Sticky Summary Bar Melayang
   */
  function renderStickyBar() {
    let total = 0;
    state.cart.forEach(raw => {
      const it = window.GroceryCalc.calculateItem(raw);
      total += it.finalSubtotal;
    });

    DOM.stickyCartTotal.textContent = window.GroceryCalc.formatRupiah(total);
    DOM.stickyItemCount.textContent = `(${state.cart.length} item)`;
  }

  /**
   * Render Tab Riwayat Sesi Belanja (F-06)
   */
  function renderHistoryTab() {
    state.sessions = window.GroceryStorage.getPastSessions();
    DOM.historySessionsContainer.innerHTML = '';
    DOM.historySessionCount.textContent = `${state.sessions.length} Sesi`;

    if (state.sessions.length === 0) {
      DOM.emptyHistoryView.classList.remove('hidden');
      return;
    }
    DOM.emptyHistoryView.classList.add('hidden');

    state.sessions.forEach(session => {
      const card = document.createElement('div');
      const dateFormatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(session.date));

      const isUnderBudget = session.totalSpent <= session.budgetCap;

      card.className = 'p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5 transition';
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <h4 class="text-xs font-bold text-white tracking-tight">${session.name}</h4>
            <span class="text-[10px] text-slate-400">${dateFormatted}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isUnderBudget ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
            ${isUnderBudget ? 'Terkendali' : 'Overbudget'}
          </span>
        </div>

        <div class="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-950/60 border border-white/5">
          <span class="text-slate-400 text-[11px]">${session.totalItems || session.items?.length || 0} Barang Belanja</span>
          <span class="font-black text-emerald-400">${window.GroceryCalc.formatRupiah(session.totalSpent)}</span>
        </div>

        ${session.note ? `<p class="text-[11px] text-slate-400 italic">"${session.note}"</p>` : ''}

        <!-- Action Buttons -->
        <div class="flex items-center gap-1.5 pt-1">
          <button class="btn-benchmark-session touch-btn flex-1 py-1.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-teal-950" data-id="${session.id}" title="Gunakan harga sesi ini untuk acuan perbandingan bulan ini!">
            <i data-lucide="check-circle" class="w-3 h-3"></i>
            <span>Jadikan Acuan</span>
          </button>
          <button class="btn-detail-session touch-btn py-1.5 px-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1" data-id="${session.id}">
            <i data-lucide="file-text" class="w-3 h-3"></i>
            <span>Nota</span>
          </button>
          <button class="btn-delete-session touch-btn p-1.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-950/50" data-id="${session.id}" title="Hapus Riwayat">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;

      DOM.historySessionsContainer.appendChild(card);
    });

    // Attach Session Event Handlers
    document.querySelectorAll('.btn-benchmark-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const res = window.GroceryStorage.applySessionAsBenchmark(id);
        if (res) {
          state.cart = window.GroceryStorage.getCurrentCart();
          renderCartList();
          showToast(`Berhasil! ${res.updatedCount} item diperbarui dengan acuan harga "${res.sessionName}".`, 'success');
          switchTab('tabCart');
        }
      });
    });

    document.querySelectorAll('.btn-detail-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openHistoryDetailModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus sesi belanja ini dari database riwayat?')) {
          window.GroceryStorage.deleteSession(id);
          renderHistoryTab();
          showToast('Sesi belanja berhasil dihapus.', 'info');
        }
      });
    });

    refreshIcons();
  }

  /**
   * Render Tab Anggaran & Analisis
   */
  function renderBudgetTab() {
    const budgetCap = state.settings.budgetCap || 400000;
    DOM.inputBudgetCap.value = new Intl.NumberFormat('id-ID').format(budgetCap);
    DOM.budgetTotalItemsCount.textContent = `${state.cart.length} Item`;

    // Kalkulasi per Kategori
    const categoryTotals = {};
    let grandTotal = 0;

    state.cart.forEach(raw => {
      const item = window.GroceryCalc.calculateItem(raw);
      const cat = item.category || 'Lainnya';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.finalSubtotal;
      grandTotal += item.finalSubtotal;
    });

    DOM.categoryBreakdownContainer.innerHTML = '';
    const categories = Object.keys(categoryTotals);

    if (categories.length === 0) {
      DOM.categoryBreakdownContainer.innerHTML = '<p class="text-xs text-slate-500 italic py-2">Belum ada item belanjaan.</p>';
      return;
    }

    const catColors = {
      'Makanan Pokok': 'from-emerald-500 to-teal-400',
      'Bumbu & Masak': 'from-amber-500 to-orange-400',
      'Mandi & Cuci': 'from-cyan-500 to-blue-400',
      'Minuman & Snack': 'from-purple-500 to-pink-400',
      'Lainnya': 'from-slate-500 to-gray-400'
    };

    categories.sort((a, b) => categoryTotals[b] - categoryTotals[a]).forEach(cat => {
      const amount = categoryTotals[cat];
      const pct = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;
      const row = document.createElement('div');
      row.className = 'space-y-1';
      row.innerHTML = `
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-300 font-medium">${cat}</span>
          <span class="font-bold text-white">${window.GroceryCalc.formatRupiah(amount)} (${pct}%)</span>
        </div>
        <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
          <div class="h-full rounded-full bg-gradient-to-r ${catColors[cat] || 'from-emerald-500 to-teal-400'}" style="width: ${pct}%;"></div>
        </div>
      `;
      DOM.categoryBreakdownContainer.appendChild(row);
    });
  }

  /**
   * Buka Modal Form Tambah / Edit Item
   */
  function openItemModal(existingItem = null) {
    state.editingItemId = existingItem ? existingItem.id : null;

    if (existingItem) {
      DOM.modalItemTitle.innerHTML = `<i data-lucide="edit" class="w-4 h-4 text-emerald-400"></i> Edit Item Belanja`;
      DOM.formItemId.value = existingItem.id;
      DOM.formItemName.value = existingItem.name;
      DOM.formItemCategory.value = existingItem.category;
      DOM.formItemUnit.value = existingItem.unit;
      DOM.formItemQty.value = existingItem.qty;
      DOM.formItemPrice.value = new Intl.NumberFormat('id-ID').format(existingItem.unitPrice);
      DOM.formItemLastMonthPrice.value = existingItem.lastMonthPrice ? new Intl.NumberFormat('id-ID').format(existingItem.lastMonthPrice) : '';
      DOM.formItemDiscount.value = existingItem.discountFormula || '';
      DOM.btnSubmitItemLabel.textContent = 'Perbarui Item';
    } else {
      DOM.modalItemTitle.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i> Tambah Item Belanja Baru`;
      DOM.itemForm.reset();
      DOM.formItemId.value = '';
      DOM.formItemQty.value = '1';
      DOM.btnSubmitItemLabel.textContent = 'Simpan ke Troli';
      DOM.formHistoricalTag.textContent = '';
    }

    updateFormPreview();

    DOM.modalItemForm.classList.remove('pointer-events-none', 'opacity-0');
    DOM.modalItemForm.classList.add('pointer-events-auto', 'opacity-100');
    const sheet = DOM.modalItemForm.querySelector('.bottom-sheet');
    sheet.classList.remove('closed');
    sheet.classList.add('open');

    refreshIcons();
    triggerHaptic('light');

    setTimeout(() => DOM.formItemName.focus(), 150);
  }

  /**
   * Tutup Modal Form Item
   */
  function closeItemModal() {
    const sheet = DOM.modalItemForm.querySelector('.bottom-sheet');
    sheet.classList.remove('open');
    sheet.classList.add('closed');
    DOM.modalItemForm.classList.remove('opacity-100');
    DOM.modalItemForm.classList.add('opacity-0');
    setTimeout(() => {
      DOM.modalItemForm.classList.remove('pointer-events-auto');
      DOM.modalItemForm.classList.add('pointer-events-none');
    }, 250);
  }

  /**
   * Update Live Preview di dalam Modal Form Item
   */
  function updateFormPreview() {
    const qty = parseFloat(DOM.formItemQty.value) || 1;
    const price = window.GroceryCalc.parseNumber(DOM.formItemPrice.value);
    const lastMonthPrice = DOM.formItemLastMonthPrice.value ? window.GroceryCalc.parseNumber(DOM.formItemLastMonthPrice.value) : null;
    const discount = DOM.formItemDiscount.value;

    const baseSubtotal = qty * price;
    const discountInfo = window.GroceryCalc.calculateTieredDiscount(baseSubtotal, discount);
    const finalSubtotal = discountInfo.finalPrice;

    DOM.formLiveSubtotalPreview.textContent = `Subtotal: ${window.GroceryCalc.formatRupiah(finalSubtotal)}`;

    // Discount Preview Explanation (F-03)
    if (discountInfo.effectiveDiscountPercent > 0) {
      DOM.formDiscountPreviewText.classList.remove('hidden');
      DOM.formDiscountPreviewText.textContent = discountInfo.formulaText;
    } else {
      DOM.formDiscountPreviewText.classList.add('hidden');
    }

    // Comparison Preview (F-04)
    if (lastMonthPrice && lastMonthPrice > 0) {
      const comp = window.GroceryCalc.comparePriceWithLastMonth(price, lastMonthPrice);
      DOM.formComparePreview.classList.remove('hidden');
      DOM.formComparePreview.classList.add('flex');

      if (comp.status === 'up') {
        DOM.formComparePreview.innerHTML = `
          <span class="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md badge-up">
            <i data-lucide="trending-up" class="w-3.5 h-3.5 text-rose-400"></i>
            ${comp.badgeText}
          </span>
          <span class="text-slate-400 text-[10px]">dari bulan lalu (${window.GroceryCalc.formatRupiah(lastMonthPrice)})</span>
        `;
      } else if (comp.status === 'down') {
        DOM.formComparePreview.innerHTML = `
          <span class="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md badge-down">
            <i data-lucide="trending-down" class="w-3.5 h-3.5 text-emerald-400"></i>
            ${comp.badgeText}
          </span>
          <span class="text-slate-400 text-[10px]">dari bulan lalu (${window.GroceryCalc.formatRupiah(lastMonthPrice)})</span>
        `;
      } else {
        DOM.formComparePreview.innerHTML = `
          <span class="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md badge-equal">
            <i data-lucide="equal" class="w-3.5 h-3.5 text-slate-300"></i>
            Harga Sama
          </span>
          <span class="text-slate-400 text-[10px]">dengan bulan lalu</span>
        `;
      }
      refreshIcons();
    } else {
      DOM.formComparePreview.classList.add('hidden');
      DOM.formComparePreview.classList.remove('flex');
    }
  }

  /**
   * Simpan Item dari Form ke Keranjang Belanja (F-01 s/d F-04)
   */
  function saveItemFromForm() {
    const name = DOM.formItemName.value.trim();
    if (!name) {
      showToast('Nama produk wajib diisi!', 'warning');
      return;
    }

    const price = window.GroceryCalc.parseNumber(DOM.formItemPrice.value);
    if (price <= 0) {
      showToast('Harga satuan harus lebih dari 0!', 'warning');
      return;
    }

    const qty = Math.max(0.1, parseFloat(DOM.formItemQty.value) || 1);
    const category = DOM.formItemCategory.value;
    const unit = DOM.formItemUnit.value;
    const lastMonthPrice = DOM.formItemLastMonthPrice.value ? window.GroceryCalc.parseNumber(DOM.formItemLastMonthPrice.value) : null;
    const discountFormula = DOM.formItemDiscount.value.trim();

    if (state.editingItemId) {
      // Update item yang ada
      const index = state.cart.findIndex(it => it.id === state.editingItemId);
      if (index !== -1) {
        state.cart[index] = {
          ...state.cart[index],
          name,
          category,
          unit,
          qty,
          unitPrice: price,
          lastMonthPrice,
          discountFormula
        };
        showToast(`Item "${name}" berhasil diperbarui.`, 'success');
      }
    } else {
      // Tambah item baru
      const newItem = {
        id: 'item-' + Date.now(),
        name,
        category,
        unit,
        qty,
        unitPrice: price,
        lastMonthPrice,
        discountFormula,
        inTrolley: true,
        note: ''
      };
      state.cart.unshift(newItem);
      showToast(`"${name}" masuk ke troli!`, 'success');
    }

    saveAndRefreshCart();
    closeItemModal();
    triggerHaptic('medium');
  }

  /**
   * Buka Modal Simpan Sesi Selesai Belanja (F-06)
   */
  function openSaveSessionModal() {
    if (state.cart.length === 0) {
      showToast('Keranjang masih kosong, belum bisa checkout!', 'warning');
      return;
    }

    let total = 0;
    state.cart.forEach(raw => {
      const it = window.GroceryCalc.calculateItem(raw);
      total += it.finalSubtotal;
    });

    const budgetCap = state.settings.budgetCap || 400000;
    const safety = window.GroceryCalc.evaluateBudgetSafety(total, budgetCap);

    DOM.modalSummaryTotal.textContent = window.GroceryCalc.formatRupiah(total);
    DOM.modalSummaryItems.textContent = `${state.cart.length} Barang Belanjaan`;
    DOM.modalSummaryStatus.textContent = safety.label;
    DOM.modalSummaryStatus.className = `font-bold ${safety.isOverbudget ? 'text-rose-400' : 'text-emerald-400'}`;

    const now = new Date();
    DOM.inputSessionName.value = `Belanja Bulanan ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)}`;
    DOM.inputSessionNote.value = '';

    DOM.modalSaveSession.classList.remove('pointer-events-none', 'opacity-0');
    DOM.modalSaveSession.classList.add('pointer-events-auto', 'opacity-100');
    const sheet = DOM.modalSaveSession.querySelector('.bottom-sheet');
    sheet.classList.remove('closed');
    sheet.classList.add('open');

    refreshIcons();
    triggerHaptic('light');
  }

  /**
   * Tutup Modal Simpan Sesi
   */
  function closeSaveSessionModal() {
    const sheet = DOM.modalSaveSession.querySelector('.bottom-sheet');
    sheet.classList.remove('open');
    sheet.classList.add('closed');
    DOM.modalSaveSession.classList.remove('opacity-100');
    DOM.modalSaveSession.classList.add('opacity-0');
    setTimeout(() => {
      DOM.modalSaveSession.classList.remove('pointer-events-auto');
      DOM.modalSaveSession.classList.add('pointer-events-none');
    }, 250);
  }

  /**
   * Konfirmasi Simpan Sesi Transaksi ke Riwayat (F-06)
   */
  function confirmSaveSession() {
    const name = DOM.inputSessionName.value.trim() || 'Belanja Bulanan';
    const note = DOM.inputSessionNote.value.trim();

    try {
      const newSession = window.GroceryStorage.saveCurrentAsSession(name, note);
      closeSaveSessionModal();
      showToast(`Transaksi "${newSession.name}" resmi tersimpan di Riwayat!`, 'success');
      switchTab('tabHistory');
    } catch (e) {
      showToast(e.message || 'Gagal menyimpan riwayat.', 'danger');
    }
  }

  /**
   * Buka Modal Rincian Nota Riwayat
   */
  function openHistoryDetailModal(sessionId) {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    DOM.historyDetailTitle.textContent = session.name;
    DOM.historyDetailDate.textContent = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(new Date(session.date));

    DOM.historyDetailItemsContainer.innerHTML = '';
    (session.items || []).forEach(it => {
      const itemRow = document.createElement('div');
      itemRow.className = 'flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs';
      itemRow.innerHTML = `
        <div>
          <div class="font-bold text-white">${it.name}</div>
          <div class="text-[10px] text-slate-400">${it.qty} ${it.unit} &times; ${window.GroceryCalc.formatRupiah(it.unitPrice)}</div>
        </div>
        <div class="font-black text-emerald-400">
          ${window.GroceryCalc.formatRupiah(it.finalSubtotal || (it.qty * it.unitPrice))}
        </div>
      `;
      DOM.historyDetailItemsContainer.appendChild(itemRow);
    });

    // Button jadikan acuan langsung dari modal detail
    DOM.btnApplyAsBenchmarkFromModal.onclick = () => {
      const res = window.GroceryStorage.applySessionAsBenchmark(session.id);
      if (res) {
        state.cart = window.GroceryStorage.getCurrentCart();
        renderCartList();
        closeHistoryDetailModal();
        showToast(`Berhasil menjadikan acuan! ${res.updatedCount} harga item diperbarui.`, 'success');
        switchTab('tabCart');
      }
    };

    DOM.modalHistoryDetail.classList.remove('pointer-events-none', 'opacity-0');
    DOM.modalHistoryDetail.classList.add('pointer-events-auto', 'opacity-100');
    const sheet = DOM.modalHistoryDetail.querySelector('.bottom-sheet');
    sheet.classList.remove('closed');
    sheet.classList.add('open');

    refreshIcons();
    triggerHaptic('light');
  }

  /**
   * Tutup Modal Riwayat Detail
   */
  function closeHistoryDetailModal() {
    const sheet = DOM.modalHistoryDetail.querySelector('.bottom-sheet');
    sheet.classList.remove('open');
    sheet.classList.add('closed');
    DOM.modalHistoryDetail.classList.remove('opacity-100');
    DOM.modalHistoryDetail.classList.add('opacity-0');
    setTimeout(() => {
      DOM.modalHistoryDetail.classList.remove('pointer-events-auto');
      DOM.modalHistoryDetail.classList.add('pointer-events-none');
    }, 250);
  }

  // Start app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

