// src/services/firebaseService.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';

// ============================================================
// TYPES (sesuaikan dengan src/types.ts Anda jika perlu)
// ============================================================

export interface WeddingData {
  // Mempelai pria
  groomName?: string;
  groomFather?: string;
  groomMother?: string;
  groomParentsAddress?: string;
  groomPhoto?: string;

  // Mempelai wanita
  brideName?: string;
  brideFather?: string;
  brideMother?: string;
  brideParentsAddress?: string;
  bridePhoto?: string;

  // Foto
  coverImage?: string;
  couplePhoto?: string;
  galleryImages?: string[];

  // Akad
  weddingDate?: string;
  weddingTime?: string;
  weddingVenue?: string;
  weddingAddress?: string;

  // Resepsi
  receptionDate?: string;
  receptionTime?: string;
  receptionVenue?: string;
  receptionAddress?: string;

  // Kutipan & cerita
  quote?: string;
  quoteSource?: string;
  story?: string;
  greeting?: string;

  // Peta & musik
  mapLink?: string;
  musicUrl?: string;

  // Amplop digital
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  bankName2?: string;
  bankAccount2?: string;
  bankHolder2?: string;

  // Font kustom
  customFont?: string;

  // Metadata
  updatedAt?: any;
}

export interface Guest {
  id: string;
  name: string;
  group: string;
  phone: string;
  tableNumber: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AdminUser {
  username: string;
  displayName: string;
  password?: string;
  role: 'super-admin' | 'user';
  isActive: boolean;
  createdAt?: any;
}

// ============================================================
// 1. WEDDING DATA
// ============================================================

/**
 * Ambil data pernikahan user dari Firestore
 */
export async function getWeddingData(username: string): Promise<WeddingData | null> {
  try {
    const docRef = doc(db, 'users', username, 'weddingData', 'data');
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as WeddingData) : null;
  } catch (error) {
    console.error('getWeddingData error:', error);
    return null;
  }
}

/**
 * Simpan data pernikahan user (merge)
 */
export async function saveWeddingData(
  username: string,
  data: Partial<WeddingData>
): Promise<void> {
  const docRef = doc(db, 'users', username, 'weddingData', 'data');
  await setDoc(
    docRef,
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Real-time listener untuk data pernikahan
 * Setiap kali data berubah (dari device manapun), callback dipanggil.
 */
export function subscribeWeddingData(
  username: string,
  callback: (data: WeddingData) => void
): Unsubscribe {
  const docRef = doc(db, 'users', username, 'weddingData', 'data');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as WeddingData);
    }
  });
}

// ============================================================
// 2. THEME
// ============================================================

/**
 * Ambil tema terpilih user
 */
export async function getTheme(username: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'users', username, 'theme', 'data');
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data().themeId as string) : null;
  } catch (error) {
    console.error('getTheme error:', error);
    return null;
  }
}

/**
 * Simpan tema terpilih user
 */
export async function saveTheme(username: string, themeId: string): Promise<void> {
  const docRef = doc(db, 'users', username, 'theme', 'data');
  await setDoc(
    docRef,
    { themeId, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Real-time listener untuk tema
 */
export function subscribeTheme(
  username: string,
  callback: (themeId: string) => void
): Unsubscribe {
  const docRef = doc(db, 'users', username, 'theme', 'data');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data().themeId as string);
    }
  });
}

// ============================================================
// 3. GUESTS
// ============================================================

/**
 * Ambil semua tamu user
 */
export async function getGuests(username: string): Promise<Guest[]> {
  try {
    const colRef = collection(db, 'users', username, 'guests');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Guest[];
  } catch (error) {
    console.error('getGuests error:', error);
    return [];
  }
}

/**
 * Tambah satu tamu, return guest ID baru
 */
export async function addGuest(
  username: string,
  guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(db, 'users', username, 'guests');
  const docRef = await addDoc(colRef, {
    ...guest,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Tambah banyak tamu sekaligus (bulk import)
 */
export async function addGuests(
  username: string,
  guests: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<string[]> {
  const ids = await Promise.all(guests.map(g => addGuest(username, g)));
  return ids;
}

/**
 * Update data tamu
 */
export async function updateGuest(
  username: string,
  guestId: string,
  data: Partial<Guest>
): Promise<void> {
  const docRef = doc(db, 'users', username, 'guests', guestId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Hapus tamu
 */
export async function deleteGuest(username: string, guestId: string): Promise<void> {
  const docRef = doc(db, 'users', username, 'guests', guestId);
  await deleteDoc(docRef);
}

/**
 * Real-time listener untuk daftar tamu
 */
export function subscribeGuests(
  username: string,
  callback: (guests: Guest[]) => void
): Unsubscribe {
  const colRef = collection(db, 'users', username, 'guests');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const guests = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Guest[];
    callback(guests);
  });
}

// ============================================================
// 4. LIVE STATUS
// ============================================================

/**
 * Ambil status live user
 */
export async function getLiveStatus(username: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', username, 'live', 'data');
    const snap = await getDoc(docRef);
    return snap.exists() ? Boolean(snap.data().isLive) : false;
  } catch (error) {
    console.error('getLiveStatus error:', error);
    return false;
  }
}

/**
 * Set status live user
 */
export async function setLiveStatus(username: string, isLive: boolean): Promise<void> {
  const docRef = doc(db, 'users', username, 'live', 'data');
  await setDoc(
    docRef,
    { isLive, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Real-time listener untuk status live
 */
export function subscribeLiveStatus(
  username: string,
  callback: (isLive: boolean) => void
): Unsubscribe {
  const docRef = doc(db, 'users', username, 'live', 'data');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(Boolean(snap.data().isLive));
    }
  });
}

// ============================================================
// 5. IMAGE UPLOAD
// ============================================================

/**
 * Cek apakah string adalah base64 image
 */
export function isBase64Image(str: string | undefined | null): boolean {
  return typeof str === 'string' && str.startsWith('data:image');
}

/**
 * Upload image base64 ke Firebase Storage, return download URL
 */
export async function uploadImage(
  base64: string,
  username: string,
  fileName: string
): Promise<string> {
  const cleanName = fileName.replace(/[^a-z0-9_-]/gi, '_');
  const storageRef = ref(
    storage,
    `users/${username}/images/${cleanName}_${Date.now()}`
  );
  const snapshot = await uploadString(storageRef, base64, 'data_url');
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Hapus image dari Firebase Storage (berdasarkan URL)
 */
export async function deleteImageFromStorage(url: string): Promise<void> {
  try {
    if (!url || !url.startsWith('http')) return;
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('deleteImageFromStorage warning:', error);
  }
}

/**
 * Migrasi semua base64 image di weddingData ke Firebase Storage
 * Return: weddingData baru dengan URL Storage
 */
export async function migrateImagesToStorage(
  username: string,
  weddingData: WeddingData
): Promise<WeddingData> {
  const migrated: WeddingData = { ...weddingData };
  const singleFields: (keyof WeddingData)[] = [
    'coverImage',
    'groomPhoto',
    'bridePhoto',
    'couplePhoto',
  ];

  // Migrate single images
  for (const field of singleFields) {
    const value = migrated[field] as string | undefined;
    if (isBase64Image(value)) {
      try {
        (migrated as any)[field] = await uploadImage(
          value!,
          username,
          String(field)
        );
      } catch (e) {
        console.error(`Gagal migrate ${String(field)}:`, e);
      }
    }
  }

  // Migrate gallery images
  if (Array.isArray(migrated.galleryImages)) {
    const newGallery: string[] = [];
    for (let i = 0; i < migrated.galleryImages.length; i++) {
      const img = migrated.galleryImages[i];
      if (isBase64Image(img)) {
        try {
          newGallery.push(await uploadImage(img, username, `gallery_${i}`));
        } catch (e) {
          console.error(`Gagal migrate gallery ${i}:`, e);
          newGallery.push(img); // fallback: simpan base64 kalau gagal
        }
      } else {
        newGallery.push(img);
      }
    }
    migrated.galleryImages = newGallery;
  }

  // Simpan hasil migrasi ke Firestore
  await saveWeddingData(username, migrated);
  return migrated;
}

// ============================================================
// 6. USER MANAGEMENT (untuk super-admin)
// ============================================================

/**
 * Ambil semua user
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ username: d.id, ...d.data() })) as AdminUser[];
  } catch (error) {
    console.error('getAllUsers error:', error);
    return [];
  }
}

/**
 * Ambil satu user by username
 */
export async function getUser(username: string): Promise<AdminUser | null> {
  try {
    const docRef = doc(db, 'users', username);
    const snap = await getDoc(docRef);
    return snap.exists()
      ? ({ username: snap.id, ...snap.data() } as AdminUser)
      : null;
  } catch (error) {
    console.error('getUser error:', error);
    return null;
  }
}

/**
 * Buat user baru (document di Firestore)
 * Catatan: Ini TIDAK membuat akun Firebase Auth.
 * Kalau pakai Firebase Auth, buat user di Auth juga via createUserWithEmailAndPassword.
 */
export async function createUser(user: {
  username: string;
  displayName: string;
  password: string;
  role: 'super-admin' | 'user';
}): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', user.username);
    const existing = await getDoc(docRef);
    if (existing.exists()) return false;

    await setDoc(docRef, {
      displayName: user.displayName,
      password: user.password, // ⚠️ Plain text — sebaiknya hash!
      role: user.role,
      isActive: true,
      createdAt: serverTimestamp(),
    });

    // Inisialisasi dokumen default untuk user baru
    await setDoc(doc(db, 'users', user.username, 'live', 'data'), {
      isLive: false,
    });
    await setDoc(doc(db, 'users', user.username, 'theme', 'data'), {
      themeId: 'elegant-gold',
    });

    return true;
  } catch (error) {
    console.error('createUser error:', error);
    return false;
  }
}

/**
 * Update user (display name)
 */
export async function updateUser(
  username: string,
  data: Partial<AdminUser>
): Promise<void> {
  const docRef = doc(db, 'users', username);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Reset password user
 */
export async function resetUserPassword(
  username: string,
  newPassword: string
): Promise<void> {
  const docRef = doc(db, 'users', username);
  await updateDoc(docRef, {
    password: newPassword,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle status aktif user
 */
export async function toggleUserActive(username: string): Promise<void> {
  const docRef = doc(db, 'users', username);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  await updateDoc(docRef, {
    isActive: !snap.data().isActive,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Hapus user beserta semua subcollection-nya
 */
export async function deleteUser(username: string): Promise<void> {
  try {
    // 1. Hapus semua tamu
    const guestsRef = collection(db, 'users', username, 'guests');
    const guestsSnap = await getDocs(guestsRef);
    await Promise.all(guestsSnap.docs.map(d => deleteDoc(d.ref)));

    // 2. Hapus subcollection docs
    await deleteDoc(doc(db, 'users', username, 'weddingData', 'data'));
    await deleteDoc(doc(db, 'users', username, 'theme', 'data'));
    await deleteDoc(doc(db, 'users', username, 'live', 'data'));

    // 3. Hapus user doc
    await deleteDoc(doc(db, 'users', username));
  } catch (error) {
    console.error('deleteUser error:', error);
  }
}

/**
 * Real-time listener untuk semua user (super-admin)
 */
export function subscribeUsers(
  callback: (users: AdminUser[]) => void
): Unsubscribe {
  const colRef = collection(db, 'users');
  return onSnapshot(colRef, (snap) => {
    const users = snap.docs.map(d => ({ username: d.id, ...d.data() })) as AdminUser[];
    callback(users);
  });
}

// ============================================================
// 7. AUTHENTICATION (username-based)
// ============================================================

/**
 * Login dengan username + password (tanpa Firebase Auth).
 * Cocok untuk aplikasi internal.
 */
export async function login(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const user = await getUser(username);
  if (!user) return null;
  if (!user.isActive) return null;
  if (user.password !== password) return null;
  return user;
}