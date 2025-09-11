# Panduan Setup Firebase Authentication

## Langkah 1: Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Create a project"** atau **"Add project"**
3. Masukkan nama project: `jir-smart-city` (atau nama lain)
4. Pilih Google Analytics (opsional)
5. Klik **"Create project"**

## Langkah 2: Enable Authentication

1. Di Firebase Console, pilih project Anda
2. Di sidebar kiri, klik **"Authentication"**
3. Klik **"Get started"**
4. Pilih tab **"Sign-in method"**
5. Enable metode berikut:
   - **Email/Password**: Klik → Enable → Save
   - **Google**: Klik → Enable → Pilih support email → Save

## Langkah 3: Dapatkan Konfigurasi Firebase

1. Di Firebase Console, klik ikon gear ⚙️ (**Project settings**)
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik **"Web app"** (</>) untuk menambahkan web app
4. Masukkan nama app: `gemastik-dashboard-web`
5. Klik **"Register app"**
6. **Copy konfigurasi Firebase** yang diberikan

## Langkah 4: Update Konfigurasi di Kode

Buka file `src/config/firebase.js` dan ganti dengan konfigurasi dari Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
}
```

## Langkah 5: Test Authentication

1. Jalankan development server:
   ```bash
   npm run dev
   ```

2. Buka `http://localhost:5173`
3. Test login dengan:
   - Daftar akun baru
   - Login dengan email/password
   - Login dengan Google

## Troubleshooting

### Error: "API key not valid"
- Pastikan API key dari Firebase Console sudah benar
- Restart development server setelah mengubah konfigurasi

### Error: "CONFIGURATION_NOT_FOUND"
- Pastikan project Firebase sudah dibuat dan aktif
- Pastikan Authentication sudah di-enable

### Error: "unauthorized-domain"
- Di Firebase Console → Authentication → Settings
- Tambahkan `localhost` ke **Authorized domains**

## Kredensial yang Diperlukan

Dari Firebase Console, Anda perlu:
- ✅ **API Key**
- ✅ **Auth Domain**
- ✅ **Project ID**
- ✅ **Storage Bucket**
- ✅ **Messaging Sender ID**
- ✅ **App ID**
- ✅ **Measurement ID** (opsional)

## Status Setup

- [ ] Project Firebase dibuat
- [ ] Authentication di-enable
- [ ] Konfigurasi Firebase di-copy
- [ ] File `firebase.js` di-update
- [ ] Test login berhasil
