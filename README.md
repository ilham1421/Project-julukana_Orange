# CAT JULUKANA - Sistem Ujian Online Berbasis Web

![Screenshot Halaman Login](https://via.placeholder.com/800x450.png?text=Screenshot+Halaman+Login)

**CAT JULUKANA** adalah aplikasi ujian online (Computer-Assisted Test) modern yang dibangun menggunakan React.js dan Tailwind CSS. Aplikasi ini dirancang untuk menyediakan platform ujian yang aman, intuitif, dan mudah dikelola, baik untuk peserta maupun administrator.

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi dan Menjalankan Proyek](#instalasi-dan-menjalankan-proyek)
- [Cara Kerja Aplikasi](#cara-kerja-aplikasi)
  - [Alur Peserta](#alur-peserta)
  - [Alur Administrator](#alur-administrator)
- [Fitur Keamanan](#fitur-keamanan)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Fitur Utama

- **Antarmuka Responsif**: Desain modern dan adaptif untuk berbagai ukuran layar menggunakan Tailwind CSS dan Shadcn/UI.
- **Dua Peran Pengguna**: Sistem membedakan antara **Peserta (Participant)** dan **Administrator**, masing-masing dengan dasbor dan hak aksesnya sendiri.
- **Manajemen Ujian oleh Admin**:
  - **Manajemen Pengguna**: Tambah, edit, dan hapus data peserta.
  - **Manajemen Soal**: Buat, edit, dan hapus bank soal ujian.
  - **Pengaturan Ujian Dinamis**: Atur durasi, nilai kelulusan, acak soal, dan fitur keamanan.
  - **Tinjau Hasil**: Lihat dan ekspor hasil ujian semua peserta.
- **Pengalaman Ujian yang Imersif**:
  - **Ruang Tunggu (Waiting Room)**: Halaman informatif sebelum ujian dimulai.
  - **Timer Ujian**: Penghitung waktu mundur yang jelas.
  - **Navigasi Soal**: Pindah antar soal dengan mudah melalui sidebar navigasi.
  - **Penyimpanan Otomatis**: Jawaban disimpan secara lokal saat dipilih.
- **Fitur Keamanan Tingkat Lanjut (Anti-Curang)**:
  - **Mode Fullscreen Paksa**: Ujian hanya bisa dikerjakan dalam mode layar penuh.
  - **Deteksi Keluar Fullscreen**: Peringatan dan sanksi jika pengguna keluar dari mode fullscreen.
  - **Deteksi Pindah Tab/Window**: Ujian akan dihentikan otomatis jika peserta mencoba beralih ke tab atau aplikasi lain.
  - **Peringatan Suara (Sirine)**: Notifikasi audio untuk pelanggaran.

## Teknologi yang Digunakan

- **Frontend**: [React.js](https://reactjs.org/) (menggunakan Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Manajemen State**: React Hooks (`useState`, `useEffect`, `useContext`, `useMemo`)
- **Penyimpanan Data**: `localStorage` (untuk simulasi database di sisi klien)

## Struktur Proyek

```
/src
├── /components         # Komponen UI yang dapat digunakan kembali (Button, Card, dll.)
│   ├── /ui             # Komponen dari Shadcn/UI
│   └── LoginScreen.jsx
│   └── ...
├── /data               # Data statis (contoh: data soal awal)
│   └── questions.js
├── /pages              # Komponen utama untuk setiap halaman/rute
│   ├── /admin          # Halaman-halaman khusus untuk dasbor admin
│   │   ├── AdminDashboard.jsx
│   │   └── ...
│   ├── UserCBT.jsx
│   └── UserWaitingRoom.jsx
├── App.jsx             # Komponen utama, menangani state global dan routing
└── main.jsx            # Titik masuk aplikasi
```

## Instalasi dan Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone Repositori**
    ```bash
    git clone https://github.com/nama-anda/cat-julukana.git
    cd cat-julukana
    ```

2.  **Instal Dependensi**
    Pastikan Anda memiliki [Node.js](https://nodejs.org/) (v16 atau lebih tinggi) dan npm terinstal.
    ```bash
    npm install
    ```

3.  **Jalankan Server Pengembangan**
    Aplikasi akan berjalan di `http://localhost:5173`.
    ```bash
    npm run dev
    ```

## Cara Kerja Aplikasi

### Alur Peserta

1.  **Login**: Peserta masuk menggunakan Nama Lengkap dan NIP yang telah didaftarkan oleh admin.
2.  **Ruang Tunggu**: Setelah login, peserta diarahkan ke halaman ruang tunggu yang berisi detail ujian dan tata cara pengerjaan.
3.  **Mulai Ujian**: Ujian dimulai dalam mode fullscreen.
4.  **Pengerjaan**: Peserta menjawab soal dan dapat menavigasi antar soal. Timer berjalan di header.
5.  **Selesai**: Peserta dapat menyelesaikan ujian secara manual atau ujian akan berakhir otomatis jika waktu habis atau terjadi pelanggaran.
6.  **Halaman Hasil**: Halaman konfirmasi bahwa ujian telah selesai.

### Alur Administrator

1.  **Login**: Admin masuk menggunakan kredensial khusus admin.
    -   **NIP Default**: `123456789012345678`
    -   **Nama Lengkap**: `Admin CAT JULUKANA`
2.  **Dasbor Admin**: Admin memiliki akses ke beberapa menu:
    -   **Dashboard**: Ringkasan singkat.
    -   **Manajemen Pengguna**: Mengelola data peserta.
    -   **Manajemen Soal**: Mengelola bank soal.
    -   **Hasil Ujian**: Melihat rekapitulasi nilai semua peserta.
    -   **Pengaturan**: Mengonfigurasi parameter ujian.

## Fitur Keamanan

Aplikasi ini mengimplementasikan beberapa lapisan keamanan di sisi klien untuk meminimalisir kecurangan:

-   **Fullscreen API**: Memaksa pengguna masuk ke mode layar penuh dan mendeteksi jika mereka keluar. Ujian akan dihentikan setelah 2 kali pelanggaran.
-   **Page Visibility API**: Mendeteksi jika tab ujian menjadi tidak aktif (pengguna beralih ke tab lain atau meminimalkan browser).
-   **Window `blur` Event**: Mendeteksi jika jendela browser kehilangan fokus (pengguna beralih ke aplikasi lain).

**Penting**: Fitur-fitur ini adalah upaya pencegahan terbaik yang bisa dilakukan di lingkungan browser standar. Untuk keamanan tingkat tertinggi, solusi seperti *lockdown browser* khusus diperlukan.

## Kontribusi

Kontribusi untuk pengembangan proyek ini sangat diterima. Jika Anda ingin berkontribusi, silakan buat *fork* dari repositori ini, buat *branch* baru untuk fitur Anda, dan ajukan *Pull Request*.

1.  Fork repositori ini.
2.  Buat branch baru (`git checkout -b fitur/NamaFitur`).
3.  Commit perubahan Anda (`git commit -m 'Menambahkan Fitur...'`).
4.  Push ke branch (`git push origin fitur/NamaFitur`).
5.  Buka Pull Request.

##BY
Muh. Ilham Akbar Teknik Informatika 22

masuk ke dashboard admin
NAMA LENGKAP: Admin CAT JULUKANA
NIP         : 123456789012345678
