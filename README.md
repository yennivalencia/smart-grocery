# 🛒 Smart Grocery & Budget Safety Tracker (PWA & Multi-Device Realtime)

Aplikasi web mobile (**Progressive Web App - PWA**) bergaya native app yang dirancang khusus untuk **siswa rantau (anak kost)** agar dapat berbelanja bulanan di supermarket secara efisien, hemat, dan aman dari risiko kehabisan uang tunai saat mendorong troli.

Kini dilengkapi arsitektur **Multi-Device Realtime Cloud Firestore**: aplikasi dapat dibuka bersamaan di smartphone (saat mendorong troli di supermarket) dan di laptop/PC (di kost/rumah), dan setiap perubahan data ter-sinkronisasi seketika dalam hitungan milidetik secara dua arah!

---

## ⚡ Arsitektur Multi-Device Realtime (Cloud Firestore & LocalStorage Fallback)

### 1. Variabel Wajib yang Disimpan ke Database
Sesi belanja aktif disimpan dalam dokumen `shopping_sessions/active_session` di Cloud Firestore dengan struktur data berikut:
- **`storeLocation`** *(String)*: Lokasi atau nama supermarket tempat belanja (misal: `"Superindo Kaliurang"`, `"Indomaret Point"`).
- **`shoppingDate`** *(String / YYYY-MM-DD)*: Tanggal sesi belanja berlangsung.
- **`walletLimit`** *(Number)*: Batas anggaran / uang tunai yang dibawa di dompet (safety cap limit).
- **`items`** *(Array of Objects)*: Seluruh daftar item di keranjang belanja, mencakup `id`, `name`, `category`, `unit`, `qty`, `unitPrice`, `lastMonthPrice`, `discountFormula`, `inTrolley`, dan `note`.
- **`totalSpent`** *(Number)*: Total tagihan keranjang terkalkulasi saat ini setelah diskon bertingkat.
- **`sessionName`** *(String)*: Judul sesi belanja aktif (misal: `"Belanja Bulanan Kost - Nov 2026"`).
- **`status`** *(String)*: Status belanja (`"active"` atau `"completed"`).
- **`lastModifiedBy`** *(String)*: Identitas perangkat yang terakhir mengubah (`"📱 HP (Mobile)"` atau `"💻 PC (Desktop)"`).
- **`updatedAt`** *(ISO String)*: Waktu terakhir data diperbarui.

### 2. Mengapa Menggunakan `onSnapshot()` (Bukan `getDoc()` / `getDocs()`)?
- **Streaming Realtime:** `onSnapshot()` membuka koneksi stream aktif dua arah ke Cloud Firestore. 
- **Tanpa Reload / Refresh:** Saat pengguna di supermarket menambah kuantitas atau mencentang item di HP, listener `onSnapshot()` di browser PC langsung menerima snapshot baru seketika (< 100ms) dan memperbarui antarmuka pengguna secara otomatis tanpa pengguna di PC harus menekan tombol refresh (F5).
- **Optimistic UI Updates:** Perubahan lokal dirender langsung di layar pengirim, sementara snapshot server mengonfirmasi penulisan data ke cloud.

### 3. Mekanisme Fallback ke LocalStorage (Offline Resilience & Anti-F5 Data Loss)
- **Local First Render:** Saat aplikasi dibuka atau tombol F5 ditekan, aplikasi pertama kali langsung membaca data dari `localStorage` (0ms delay, tidak ada layar blank atau loading lama).
- **Tahan Basement Supermarket:** Ketika sinyal di dalam supermarket melemah atau offline:
  1. Seluruh perubahan belanjaan tetap tersimpan aman di `localStorage` lokal.
  2. Firebase Offline Persistence (`enableIndexedDbPersistence`) mencatat antrian perubahan.
  3. Indikator di header berubah menjadi `🔴 Mode Offline (LocalStorage)`.
  4. Pengguna bebas me-refresh halaman (F5), data belanjaan **100% aman dan tidak akan hilang**.
  5. Begitu HP kembali mendapat sinyal internet, data otomatis disinkronkan ke Cloud Firestore dan layar PC langsung ter-update.

---

## 📱 Arsitektur & Mobile-First UI/UX
1. **Smartphone Frame Viewport:** Didesain khusus untuk layar smartphone dengan lebar maksimal `430px` (terpusat secara elegan di layar browser desktop).
2. **Navigasi Bawah Melayang (Floating Bottom Dock):** Tab navigasi ramah jempol dengan ikon Lucide untuk beralih antara:
   - 🛒 **Belanja:** Daftar troli barang aktif, stepper kuantitas real-time, komparator harga, diskon.
   - 📜 **Riwayat:** Database transaksi masa lalu, detail nota belanja, dan fitur acuan bulan depan.
   - 🛡️ **Anggaran:** Kendali Safety Cap dompet, visualisasi breakdown kategori, lokasi supermarket, tanggal, dan tips belanja hemat anak kost.
3. **Multi-Device Status Bar:** Header dilengkapi indikator status realtime cloud (`🟢 Realtime Multi-Device` / `🔴 Offline LocalStorage`) serta tombol sentuh cepat untuk mengubah lokasi supermarket dan tanggal belanja.
4. **Ergonomi Sentuh:** Tombol aksi besar, kontrol kuantitas (`+` / `-` stepper), checklist troli, dan bar ringkasan sticky yang melayang di atas navigasi bawah.
5. **PWA Standalone & Offline Ready:** Dilengkapi `manifest.json`, Service Worker (`sw.js`), dan penyimpanan `localStorage`.

---

## 📋 Checklist Implementasi Kebutuhan Fungsional (SRS)

| Kode | Fitur | Status | Deskripsi Implementasi |
|---|---|---|---|
| **F-01** | **Pencatatan Item Belanja Lengkap** | ✅ Selesai | Formulir lengkap: Nama produk (+ preset cepat belanja kost), Kategori, Satuan (kg, liter, pcs, pack, botol, sachet, roll), Qty, Harga Satuan, dan Harga Bulan Lalu. |
| **F-02** | **Perhitungan Kuantitas Otomatis** | ✅ Selesai | Perubahan Qty dan harga langsung menghitung subtotal baris dan total keranjang secara instan (*real-time*) tanpa perlu menekan tombol hitung. |
| **F-03** | **Kalkulator Diskon Bertingkat** | ✅ Selesai | Mendukung diskon tunggal (cth: `25%`) maupun diskon bertumpuk (cth: `50% + 20%`). Menggunakan rumus matematis riil: $P_1 = P \times (1 - 50/100)$, $P_2 = P_1 \times (1 - 20/100)$ -> Diskon efektif 60% (bukan 70%). Dilengkapi badge nominal penghematan. |
| **F-04** | **Komparator Harga Realtime vs Bulan Lalu** | ✅ Selesai | Indikator visual seketika: <br>🔴 **Panah Merah Naik ($\uparrow$):** Lebih mahal (+X%) <br>🟢 **Panah Hijau Turun ($\downarrow$):** Lebih hemat / promo (-X%) <br>⚪ **Tanda Setara ($=$):** Harga stabil. |
| **F-05** | **Pengendali Anggaran (Safety Cap / Wallet Limit)** | ✅ Selesai | Indikator batas dompet dengan 4 level: <br>🟢 **Aman** (< 75%) <br>🟡 **Waspada** (75% - 90%) <br>🟠 **Siaga Merah** (90% - 100%) <br>🔴 **BAHAYA OVERBUDGET** (> 100%) dengan alarm visual pulsing merah dan nominal minus. |
| **F-06** | **Riwayat & Database Belanja** | ✅ Selesai | Penyimpanan transaksi bulanan ke `localStorage` dan Cloud Firestore, fitur *"Jadikan Acuan Bulan Depan"* untuk auto-fill harga pembanding, serta fitur Export/Import data JSON. |

---

## 🚀 Cara Menjalankan & Menguji Multi-Device Realtime

### Langkah 1: Buka di Browser PC
- Buka file `index.html` di Google Chrome atau Microsoft Edge di PC.
- Amati header: badge sinkronisasi akan menampilkan `🟢 Multi-Device Realtime` dengan label `💻 PC (Desktop)`.

### Langkah 2: Buka di HP (Smartphone)
- Jalankan local web server atau akses URL yang sama di browser HP Anda.
- Header di HP akan mendeteksi `📱 HP (Mobile)`.

### Langkah 3: Uji Sinkronisasi Realtime Tanpa Reload
1. Di layar HP, tekan tombol `+` pada kuantitas salah satu item (misal: Indomie atau Beras) atau centang checkbox troli.
2. **Lihat layar PC:** Tanpa menekan tombol F5 / refresh apa pun, angka kuantitas, subtotal, status troli, dan sisa anggaran di layar PC akan langsung berubah seketika detik itu juga!
3. Begitu pula sebaliknya: ubah batas anggaran atau lokasi toko di PC, layar HP langsung ter-update otomatis.
