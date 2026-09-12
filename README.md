# 💍 Premium Wedding Invitation - Multi-User Platform

Platform undangan pernikahan premium dengan sistem multi-user. Admin super dapat mengelola ribuan user, dan setiap user memiliki undangan mereka sendiri.

## ✨ Fitur Utama

### 👑 Super Admin Panel
- **Buat user baru** - Username, password, dan display name
- **Kelola ribuan user** - Edit, hapus, aktifkan/nonaktifkan
- **Reset password** user kapan saja
- **Lihat password** user (toggle show/hide)
- **Search** user berdasarkan nama atau username
- **Statistik** total user aktif

### 👤 User Dashboard (per user)
- Edit data pernikahan lengkap
- Upload foto mempelai (auto-compress)
- Pilih dari 24 tema premium
- Pilih dari 28+ font modern
- Manajemen tamu undangan (ribuan)
- Generate link WhatsApp personal
- Toggle Go Live/Offline

### 🎨 24 Tema Premium
Elegant Gold, Rustic Blush, Modern Minimalist, Royal Purple, Garden Green, Ocean Blue, Sunset Orange, Dark Romance, Dusty Rose, Boho Chic, Midnight Star, Tropical Paradise, Vintage Cream, Cherry Blossom, Luxury Black, Lavender Dream, Earth Tone, Arctic Ice, Copper & Rose, Safari Adventure, Pearl White, Emerald Night, Coral Reef, Golden Hour

### 🔤 28+ Font Modern
Sans-serif, Serif, Display, Modern, dan Handwriting fonts dari Google Fonts

### 👥 Manajemen Tamu
- Import massal ribuan tamu
- Generate link undangan personal per tamu
- Kirim via WhatsApp (individual & broadcast)
- Export CSV
- Tracking RSVP

### 💌 Undangan Futuristik
- Animated orbs & particles
- Glassmorphism cards
- Cursor glow effect
- Grid pattern overlay
- Neon text effects
- Responsive design

## 🚀 Cara Menggunakan

### 1. Login sebagai Super Admin
- URL: `yoursite.com/#/admin`
- Default: **admin** / **admin123**

### 2. Buat User Baru
1. Login sebagai super admin
2. Klik tab "Kelola User"
3. Klik "Tambah User"
4. Isi username, display name, password
5. Klik "Buat User"
6. Bagikan kredensial ke pemilik undangan

### 3. User Login & Setup
1. User login dengan kredensial yang diberikan
2. Isi data pernikahan, upload foto
3. Pilih tema dan font
4. Tambahkan daftar tamu
5. Klik "Go Live!"

### 4. Akses Undangan
- Undangan user: `yoursite.com/?user=username`
- Link personal tamu: `yoursite.com/?user=username&to=NamaTamu`

## 📋 Format Import Tamu Massal
```
Nama, Grup, No. WhatsApp, No. Meja
Budi Santoso, Keluarga, 081234567890, 5
Ani Wijaya, Teman SMA, 089876543210, 3
```

## 🌐 Deployment (GitHub + Vercel)

```bash
git init
git add .
git commit -m "Wedding invitation platform"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Lalu import repository ke Vercel.

## 🔒 Keamanan
- Super admin hanya 1 (tidak bisa dihapus)
- User bisa diaktifkan/nonaktifkan
- Password bisa di-reset oleh super admin
- Data tersimpan di localStorage (per browser)

## 🛠️ Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Lucide React (icons)
- browser-image-compression
- Google Fonts

---
Made with ❤️ for your special day
