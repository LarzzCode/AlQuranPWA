# 📖 Quran Pribadi (Personal Quran PWA)

Aplikasi Web PWA personal untuk membaca Al-Quran dengan tampilan elegan ala iOS, **100% bebas dari segala jenis iklan**, cepat, ringan, dan dirancang khusus untuk kenyamanan membaca harian Anda.

---

## ✨ Fitur Utama (Versi 1.0)

1. **Khusus Rutinitas Harian Pribadi**:
   - 🌅 **Pagi**: Akses instan ke **Surat Al-Waqi'ah** (Surat ke-56) — Fadhilah pembuka rezeki & keberkahan.
   - 🌙 **Malam**: Akses instan ke **Surat Al-Mulk** (Surat ke-67) — Penyelamat dari siksa kubur.
   - 🛡️ **Penutup Malam**: Akses terfokus ke **3 Ayat Terakhir Surat Al-Baqarah (Ayat 284–286)** — Pelindung & pencukup kebutuhan malam hari.

2. **3 Pilihan Tema Tampilan (Reading Modes)**:
   - ☀️ **Mode Terang (*Light*)**: Desain bersih ala iOS dengan latar lembut `#F2F2F7` dan kartu putih bersih.
   - 📜 **Mode Sepia (*Warm Parchment*)**: Nada kertas hangat yang sangat nyaman di mata untuk membaca santai.
   - 🌑 **Mode Gelap (*Dark OLED*)**: Hitam pekat sejati ala iOS untuk kenyamanan membaca di malam hari dan hemat baterai.

3. **Daftar Lengkap 114 Surat & Pencarian Cepat**:
   - Menampilkan 114 surat Al-Quran lengkap dengan nomor, teks Arab, nama Latin, arti, tempat turun (Makkiyah/Madaniyah), serta jumlah ayat.
   - Kolom pencarian responsif untuk mencari nama surat, nomor, atau terjemahan.
   - Filter segmented control: *Semua (114)*, *Makkiyah (86)*, *Madaniyah (28)*.

4. **Mushaf & Reader Khusyu' Bebas Iklan**:
   - Tipografi Arab elegan (*Amiri & Scheherazade New*) dengan tanda wakaf & harakat yang jelas.
   - Pengatur ukuran huruf Arab (*A- / A+ slider*).
   - Saklar untuk menampilkan/menyembunyikan teks transliterasi Latin dan terjemahan bahasa Indonesia (Kemenag RI).
   - Pemutar audio murottal per ayat dan murottal lengkap satu surat (Qari: Syekh Misyari Rasyid Al-Afasi).
   - Fitur bookmark otomatis *Terakhir Dibaca*.
   - Tombol salin ayat dan terjemahan.

5. **Notifikasi Pengingat Rutinitas**:
   - Menggunakan *Web Notification API* dan *Service Worker*.
   - Jam pengingat pagi dan malam yang dapat disesuaikan.
   - Tombol *Uji Notifikasi Sekarang* untuk memastikan pemberitahuan berfungsi lancar di perangkat Anda.

6. **PWA (Progressive Web App) Siap Install di Android & iOS**:
   - Dapat di-install langsung ke Layar Utama (*Home Screen*) layaknya aplikasi bawaan (native app) tanpa address bar browser.
   - Dukungan *Service Worker & CacheFirst* untuk akses offline saat kuota internet tidak stabil.

---

## 🚀 Cara Menjalankan Project

### 1. Mode Development:
Buka terminal di folder project `d:\PROJECT\QuranApp`, lalu jalankan:
```bash
npm run dev
```
Akses di browser laptop: `http://localhost:5173`  
Untuk membuka di HP (iPhone / Android) yang terhubung ke satu jaringan Wi-Fi yang sama, gunakan alamat Network yang muncul di terminal (misalnya `http://192.168.x.x:5173`).

### 2. Mode Produksi:
```bash
npm run build
npm run preview
```

---

## 📱 Panduan Memasang di Layar Utama (PWA)

### Pengguna iPhone / iPad (iOS):
1. Buka aplikasi di browser **Safari**.
2. Ketuk tombol **Share** (ikon kotak dengan panah ke atas di bagian bawah layar).
3. Gulir ke bawah dan pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
4. Ketuk **Tambah**. Aplikasi kini akan tampil di Home Screen seperti aplikasi dari App Store.

### Pengguna Android:
1. Buka aplikasi di browser **Chrome**.
2. Ketuk ikon titik tiga di kanan atas.
3. Pilih **"Install aplikasi"** atau **"Tambahkan ke Layar Utama"**.
