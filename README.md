# 🛒 Smart Grocery & Budget Safety Tracker (PWA)

Aplikasi web mobile (**Progressive Web App - PWA**) bergaya native app yang dirancang khusus untuk **siswa rantau (anak kost)** agar dapat berbelanja bulanan di supermarket secara efisien, hemat, dan aman dari risiko kehabisan uang tunai saat mendorong troli.

---

## 📱 Arsitektur & Mobile-First UI/UX
1. **Smartphone Frame Viewport:** Didesain khusus untuk layar smartphone dengan lebar maksimal `430px` (terpusat secara elegan di layar browser desktop).
2. **Navigasi Bawah Melayang (Floating Bottom Dock):** Tab navigasi ramah jempol dengan ikon Lucide untuk beralih antara:
   - 🛒 **Belanja:** Daftar troli barang aktif, stepper jumlah real-time, komparator harga, diskon.
   - 📜 **Riwayat:** Database transaksi masa lalu, detail nota belanja, dan fitur acuan bulan depan.
   - 🛡️ **Anggaran:** Kendali Safety Cap dompet, visualisasi breakdown kategori, dan tips belanja hemat anak kost.
3. **Ergonomi Sentuh:** Tombol aksi besar, kontrol kuantitas (`+` / `-` stepper), checklist troli, dan bar ringkasan sticky yang melayang di atas navigasi bawah.
4. **PWA Standalone & Offline Ready:** Dilengkapi `manifest.json`, Service Worker (`sw.js`), dan penyimpanan `localStorage` agar tetap berfungsi mulus di basement supermarket tanpa sinyal internet.

---

## 📋 Checklist Implementasi Kebutuhan Fungsional (SRS)

| Kode | Fitur | Status | Deskripsi Implementasi |
|---|---|---|---|
| **F-01** | **Pencatatan Item Belanja Lengkap** | ✅ Selesai | Formulir lengkap: Nama produk (+ preset cepat belanja kost), Kategori, Satuan (kg, liter, pcs, pack, botol, sachet, roll), Qty, Harga Satuan, dan Harga Bulan Lalu. |
| **F-02** | **Perhitungan Kuantitas Otomatis** | ✅ Selesai | Perubahan Qty dan harga langsung menghitung subtotal baris dan total keranjang secara instan (*real-time*) tanpa perlu menekan tombol hitung. |
| **F-03** | **Kalkulator Diskon Bertingkat** | ✅ Selesai | Mendukung diskon tunggal (cth: `25%`) maupun diskon bertumpuk (cth: `50% + 20%`). Menggunakan rumus matematis riil: $P_1 = P \times (1 - 50/100)$, $P_2 = P_1 \times (1 - 20/100)$ -> Diskon efektif 60% (bukan 70%). Dilengkapi badge nominal penghematan. |
| **F-04** | **Komparator Harga Realtime vs Bulan Lalu** | ✅ Selesai | Indikator visual seketika: <br>🔴 **Panah Merah Naik ($\uparrow$):** Lebih mahal (+X%) <br>🟢 **Panah Hijau Turun ($\downarrow$):** Lebih hemat / promo (-X%) <br>⚪ **Tanda Setara ($=$):** Harga stabil. |
| **F-05** | **Pengendali Anggaran (Safety Cap)** | ✅ Selesai | Indikator batas dompet dengan 4 level: <br>🟢 **Aman** (< 75%) <br>🟡 **Waspada** (75% - 90%) <br>🟠 **Siaga Merah** (90% - 100%) <br>🔴 **BAHAYA OVERBUDGET** (> 100%) dengan alarm visual pulsing merah dan nominal minus. |
| **F-06** | **Riwayat & Database Belanja** | ✅ Selesai | Penyimpanan transaksi bulanan ke `localStorage`, fitur *"Jadikan Acuan Bulan Depan"* untuk auto-fill harga pembanding, serta fitur Export/Import data JSON. |

---

## 🚀 Cara Menjalankan & Membuka Aplikasi

1. **Jalankan Langsung di Browser:**
   - Cukup buka file `index.html` dengan browser modern apa pun (Google Chrome, Microsoft Edge, Safari, atau Firefox).
   - Di desktop, tampilan otomatis berbentuk frame smartphone centered (lebar 430px).

2. **Pasang sebagai PWA di Smartphone (Add to Home Screen):**
   - Buka aplikasi di browser Chrome / Safari ponsel Anda.
   - Tekan menu browser lalu pilih **"Tambahkan ke Layar Utama" / "Install App"**.
   - Aplikasi akan terpasang di smartphone tanpa address bar browser seperti aplikasi native.
