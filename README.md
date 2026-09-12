# 💍 Premium Wedding Invitation Website

Website undangan pernikahan premium dengan fitur lengkap. Dibuat dengan React, Vite, Tailwind CSS, dan Zustand.

## ✨ Fitur Utama

### 🎨 24 Tema Premium
- Elegant Gold, Rustic Blush, Modern Minimalist, Royal Purple
- Garden Green, Ocean Blue, Sunset Orange, Dark Romance
- Dusty Rose, Boho Chic, Midnight Star, Tropical Paradise
- Vintage Cream, Cherry Blossom, Luxury Black, Lavender Dream
- Earth Tone, Arctic Ice, Copper & Rose, Safari Adventure
- Pearl White, Emerald Night, Coral Reef, Golden Hour

### 👥 Manajemen Tamu
- Tambah tamu satu per satu
- **Import massal** ribuan tamu sekaligus (format CSV/text)
- Generate link undangan personal untuk setiap tamu
- Kirim undangan via WhatsApp (individual & broadcast)
- Export daftar tamu ke CSV
- Tracking status kehadiran (RSVP)

### ⚙️ Panel Admin
- Login dengan username & password
- Edit data mempelai (nama, orang tua, alamat)
- Edit detail acara (akad & resepsi)
- Edit kutipan & cerita cinta
- Atur amplop digital (2 rekening)
- Atur peta lokasi & musik
- Ganti tema undangan
- Toggle website live/offline

### 💌 Halaman Undangan
- Cover page elegan dengan animasi
- Personalisasi nama tamu (via URL parameter)
- Countdown timer ke hari H
- Detail akad & resepsi
- Link Google Maps
- Amplop digital (copy no. rekening)
- RSVP konfirmasi kehadiran
- Ucapan & doa dari tamu
- Responsive design (mobile & desktop)

## 🚀 Cara Menggunakan

### 1. Akses Admin Panel
- Buka website dengan menambahkan `#/admin` di URL
- Contoh: `https://your-domain.com/#/admin`
- Login default: **admin** / **admin123**

### 2. Setup Undangan
1. Login ke admin panel
2. Isi data pernikahan (nama mempelai, tanggal, venue, dll)
3. Pilih tema yang diinginkan
4. Tambahkan daftar tamu
5. Klik "Go Live!" untuk mempublikasikan

### 3. Kirim Undangan
- **Individual**: Klik ikon WhatsApp di samping nama tamu
- **Massal**: Klik "Kirim Semua WA" untuk broadcast
- **Generate Links**: Download file berisi semua link undangan
- Setiap tamu mendapat link personal: `?to=NamaTamu`

### 4. Format Import Tamu Massal
```
Nama Tamu, Grup, No. WhatsApp, No. Meja
Budi Santoso, Keluarga, 081234567890, 5
Ani Wijaya, Teman SMA, 089876543210, 3
Rekan Kerja, Kantor, 08111222333, 1
```
Pemisah: koma (,), titik koma (;), atau tab

## 🌐 Deployment ke Vercel via GitHub

### Step 1: Buat Repository GitHub
```bash
git init
git add .
git commit -m "Initial commit - Wedding Invitation"
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

### Step 2: Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub
3. Klik "New Project"
4. Import repository dari GitHub
5. Vercel akan otomatis detect Vite project
6. Klik "Deploy"
7. Website akan live di: `https://repo-name.vercel.app`

### Step 3: Custom Domain (Opsional)
1. Di Vercel dashboard → Settings → Domains
2. Tambahkan domain custom
3. Update DNS sesuai instruksi Vercel

## 🔧 Konfigurasi

### Mengubah Kredensial Admin
1. Login ke admin panel
2. Buka tab "Pengaturan"
3. Ubah username, password, dan display name
4. Perubahan otomatis tersimpan

### Data Storage
Semua data disimpan di **localStorage** browser. Data akan tetap ada selama browser tidak di-clear.

## 📱 Struktur Halaman

| URL | Halaman |
|-----|---------|
| `/` | Halaman Undangan (untuk tamu) |
| `/?to=Nama` | Undangan dengan nama tamu |
| `/#/admin` | Login Admin Panel |

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **Lucide React** - Icons
- **Google Fonts** - Typography

## 📝 Catatan Penting

- Website menggunakan localStorage untuk menyimpan data
- Untuk production, disarankan menggunakan backend database
- Musik bisa ditambahkan via URL mp3 eksternal
- Semua 24 tema bisa dikustomisasi lebih lanjut

---

Made with ❤️ for your special day
