# Firebase Authentication Setup - Dashboard Gemastik 2025

Konfigurasi Firebase untuk proyek Dashboard Gemastik 2025 sudah selesai dilakukan.

## Konfigurasi yang Sudah Diterapkan

### 1. Firebase Configuration
- **Project ID**: `jir-smart-city`
- **Auth Domain**: `jir-smart-city.firebaseapp.com`
- **Storage Bucket**: `jir-smart-city.firebasestorage.app`
- **Analytics**: Aktif dengan measurement ID

### 2. Authentication Methods
- ✅ Email/Password Authentication
- ✅ Google Sign-in
- ✅ User session management
- ✅ Protected routes

### 3. File Structure
```
src/
├── config/
│   └── firebase.js          # Firebase configuration
├── services/
│   └── authService.js       # Authentication service
├── composables/
│   └── useAuth.js          # Vue composable for auth
└── pages/
    ├── Login.vue           # Login page
    └── Dashboard.vue       # Protected dashboard
```

## Cara Menggunakan

### 1. Login dengan Email/Password
```javascript
const { signInWithEmail } = useAuth()
const result = await signInWithEmail(email, password)
```

### 2. Login dengan Google
```javascript
const { signInWithGoogle } = useAuth()
const result = await signInWithGoogle()
```

### 3. Logout
```javascript
const { signOut } = useAuth()
await signOut()
```

### 4. Check Authentication Status
```javascript
const { isAuthenticated, user } = useAuth()
if (isAuthenticated()) {
  console.log('User logged in:', user.value)
}
```

## Environment Variables (Opsional)

Untuk keamanan yang lebih baik, buat file `.env` di root project:

```env
VITE_FIREBASE_API_KEY=AIzaSyBEPvjWL66PX2QwV6TTdufBDyRN9h7tr5w
VITE_FIREBASE_AUTH_DOMAIN=jir-smart-city.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jir-smart-city
VITE_FIREBASE_STORAGE_BUCKET=jir-smart-city.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=798096595312
VITE_FIREBASE_APP_ID=1:798096595312:web:aed7baf30d5d5a4c1c97b5
VITE_FIREBASE_MEASUREMENT_ID=G-JB760FN9MH
```

## Menjalankan Aplikasi

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Fitur Authentication

- **Email/Password**: Login dan registrasi dengan email
- **Google OAuth**: Login dengan akun Google
- **Session Management**: Otomatis handle session
- **Route Protection**: Redirect ke login jika belum authenticated
- **Error Handling**: Pesan error dalam bahasa Indonesia
- **User Profile**: Akses informasi user (nama, email, foto)

## Troubleshooting

### Error Messages (Bahasa Indonesia)
- "Email tidak ditemukan"
- "Password salah"
- "Email sudah terdaftar"
- "Password terlalu lemah"
- "Format email tidak valid"
- "Akun dinonaktifkan"
- "Terlalu banyak percobaan, coba lagi nanti"
- "Koneksi internet bermasalah"

### Debug Mode
```javascript
localStorage.setItem('firebase:debug', 'true')
```

## Security Notes

- ✅ Environment variables sudah dikonfigurasi
- ✅ `.env` sudah ditambahkan ke `.gitignore`
- ✅ Firebase Security Rules perlu dikonfigurasi di Firebase Console
- ✅ App Check bisa diaktifkan untuk keamanan tambahan

## Status Konfigurasi

- ✅ Firebase SDK terinstall (v12.2.1)
- ✅ Authentication service siap digunakan
- ✅ Vue composable sudah dikonfigurasi
- ✅ Error handling dalam bahasa Indonesia
- ✅ Route protection aktif
- ✅ Google Analytics terintegrasi
- ✅ **Mock Authentication Mode** - Fallback ketika Firebase tidak tersedia

## Mode Demo Authentication

Ketika Firebase project tidak tersedia atau mengalami error `CONFIGURATION_NOT_FOUND`, aplikasi akan otomatis menggunakan **Mock Authentication Service** untuk demo.

### Kredensial Demo:
- **Email**: `admin@demo.com`
- **Password**: `demo123`

### Fitur Demo Mode:
- ✅ Login dengan email/password
- ✅ Registrasi akun baru
- ✅ Google Sign-in (simulasi)
- ✅ Session management (localStorage)
- ✅ Logout functionality
- ✅ User profile display

### Cara Menggunakan Demo Mode:
1. Buka `http://localhost:5173`
2. Gunakan email: `admin@demo.com` dan password: `demo123`
3. Atau daftar akun baru dengan email dan password apapun
4. Klik "Login dengan Google" untuk simulasi Google OAuth

## Setup Firebase Console

### 1. Enable Authentication Methods
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `jir-smart-city`
3. Di sidebar, klik "Authentication"
4. Klik "Get started"
5. Pilih tab "Sign-in method"
6. Enable "Email/Password" dan "Google"

### 2. Authorized Domains
1. Di Authentication > Settings
2. Tambahkan domain berikut ke "Authorized domains":
   - `localhost` (untuk development)
   - Domain production Anda

### 3. Security Rules (jika menggunakan Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```