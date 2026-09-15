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
  listAll,
} from 'firebase/storage';
import { db, storage } from './firebase';

// ============================================================
// TYPES
// ============================================================

export interface WeddingData {
  groomName?: string;
  groomFather?: string;
  groomMother?: string;
  groomParentsAddress?: string;
  groomPhoto?: string;
  brideName?: string;
  brideFather?: string;
  brideMother?: string;
  brideParentsAddress?: string;
  bridePhoto?: string;
  coverImage?: string;
  couplePhoto?: string;
  galleryImages?: string[];
  weddingDate?: string;
  weddingTime?: string;
  weddingVenue?: string;
  weddingAddress?: string;
  receptionDate?: string;
  receptionTime?: string;
  receptionVenue?: string;
  receptionAddress?: string;
  quote?: string;
  quoteSource?: string;
  story?: string;
  greeting?: string;
  mapLink?: string;
  musicUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  bankName2?: string;
  bankAccount2?: string;
  bankHolder2?: string;
  customFont?: string;
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
  updatedAt?: any;
}

// ============================================================
// 1. WEDDING DATA
// ============================================================

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

export async function saveWeddingData(
  username: string,
  data: Partial<WeddingData>
): Promise<void> {
  const docRef = doc(db, 'users', username, 'weddingData', 'data');
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeWeddingData(
  username: string,
  callback: (data: WeddingData) => void
): Unsubscribe {
  const docRef = doc(db, 'users', username, 'weddingData', 'data');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as WeddingData);
      }
    },
    (error) => {
      console.error('subscribeWeddingData error:', error);
    }
  );
}

// ============================================================
// 2. THEME
// ============================================================

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

export async function saveTheme(username: string, themeId: string): Promise<void> {
  const docRef = doc(db, 'users', username, 'theme', 'data');
  await setDoc(docRef, { themeId, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeTheme(
  username: string,
  callback: (themeId: string) => void
): Unsubscribe {
  const docRef = doc(db, 'users', username, 'theme', 'data');
  return onSnapshot(
    docRef,
    (snap) => {
      callback(snap.exists() ? (snap.data().themeId as string) : 'elegant-gold');
    },
    (error) => {
      console.error('subscribeTheme error:', error);
    }
  );
}

// ============================================================
// 3. GUESTS
// ============================================================

export async function getGuests(username: string): Promise<Guest[]> {
  try {
    const colRef = collection(db, 'users', username, 'guests');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Guest[];
  } catch (error) {
    console.error('getGuests error:', error);
    return [];
  }
}

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

export async function addGuests(
  username: string,
  guests: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<string[]> {
  return Promise.all(guests.map((g) => addGuest(username, g)));
}

export async function updateGuest(
  username: string,
  guestId: string,
  data: Partial<Guest>
): Promise<void> {
  const docRef = doc(db, 'users', username, 'guests', guestId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteGuest(username: string, guestId: string): Promise<void> {
  const docRef = doc(db, 'users', username, 'guests', guestId);
  await deleteDoc(docRef);
}

export function subscribeGuests(
  username: string,
  callback: (guests: Guest[]) => void
): Unsubscribe {
  const colRef = collection(db, 'users', username, 'guests');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const guests = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Guest[];
      callback(guests);
    },
    (error) => {
      console.error('subscribeGuests error:', error);
    }
  );
}

// ============================================================
// 4. LIVE STATUS
// ============================================================

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

export async function setLiveStatus(username: string, isLive: boolean): Promise<void> {
  const docRef = doc(db, 'users', username, 'live', 'data');
  await setDoc(docRef, { isLive, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeLiveStatus(
  username: string,
  callback: (isLive: boolean) => void
): Unsubscribe {
  const docRef = doc(db, 'users', username, 'live', 'data');
  return onSnapshot(
    docRef,
    (snap) => {
      callback(snap.exists() ? Boolean(snap.data().isLive) : false);
    },
    (error) => {
      console.error('subscribeLiveStatus error:', error);
    }
  );
}

// ============================================================
// 5. IMAGE UPLOAD
// ============================================================

export function isBase64Image(str: string | undefined | null): boolean {
  return typeof str === 'string' && str.startsWith('data:image');
}

export async function uploadImage(
  base64: string,
  username: string,
  fileName: string
): Promise<string> {
  const cleanName = fileName.replace(/[^a-z0-9_-]/gi, '_');
  const storageRef = ref(storage, `users/${username}/images/${cleanName}_${Date.now()}`);
  const snapshot = await uploadString(storageRef, base64, 'data_url');
  return getDownloadURL(snapshot.ref);
}

export async function deleteImageFromStorage(url: string): Promise<void> {
  try {
    if (!url || !url.startsWith('http')) return;
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('deleteImageFromStorage warning:', error);
  }
}

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

  for (const field of singleFields) {
    const value = migrated[field] as string | undefined;
    if (isBase64Image(value)) {
      try {
        (migrated as any)[field] = await uploadImage(value!, username, String(field));
      } catch (e) {
        console.error(`Gagal migrate ${String(field)}:`, e);
      }
    }
  }

  if (Array.isArray(migrated.galleryImages)) {
    const newGallery: string[] = [];
    for (let i = 0; i < migrated.galleryImages.length; i++) {
      const img = migrated.galleryImages[i];
      if (isBase64Image(img)) {
        try {
          newGallery.push(await uploadImage(img, username, `gallery_${i}`));
        } catch (e) {
          console.error(`Gagal migrate gallery ${i}:`, e);
          newGallery.push(img);
        }
      } else {
        newGallery.push(img);
      }
    }
    migrated.galleryImages = newGallery;
  }

  await saveWeddingData(username, migrated);
  return migrated;
}

// ============================================================
// 6. USER MANAGEMENT
// ============================================================

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => {
      const data = d.data();
      delete (data as any).username;
      return { ...data, username: d.id } as AdminUser;
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return [];
  }
}

export async function getUser(username: string): Promise<AdminUser | null> {
  try {
    const docRef = doc(db, 'users', username);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    delete (data as any).username;
    return { ...data, username: snap.id } as AdminUser;
  } catch (error) {
    console.error('getUser error:', error);
    return null;
  }
}

export async function createUser(user: {
  username: string;
  displayName: string;
  password: string;
  role: 'super-admin' | 'user';
  createdAt?: string;
  isActive?: boolean;
}): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', user.username);
    const existing = await getDoc(docRef);
    if (existing.exists()) return false;

    await setDoc(docRef, {
      displayName: user.displayName,
      password: user.password,
      role: user.role,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Init default docs
    await setDoc(doc(db, 'users', user.username, 'live', 'data'), { isLive: false });
    await setDoc(doc(db, 'users', user.username, 'theme', 'data'), {
      themeId: 'elegant-gold',
    });

    return true;
  } catch (error) {
    console.error('createUser error:', error);
    return false;
  }
}

export async function updateUser(username: string, data: Partial<AdminUser>): Promise<void> {
  const docRef = doc(db, 'users', username);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

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

export async function toggleUserActive(username: string): Promise<void> {
  const docRef = doc(db, 'users', username);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  await updateDoc(docRef, {
    isActive: !snap.data().isActive,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUser(username: string): Promise<void> {
  try {
    // 1. Hapus semua guests
    const guestsRef = collection(db, 'users', username, 'guests');
    const guestsSnap = await getDocs(guestsRef);
    await Promise.all(guestsSnap.docs.map((d) => deleteDoc(d.ref)));

    // 2. Hapus semua file gambar di Storage (biar tidak orphan)
    try {
      const folderRef = ref(storage, `users/${username}/images`);
      const list = await listAll(folderRef);
      await Promise.all(list.items.map((item) => deleteObject(item)));
    } catch (storageErr) {
      // Folder mungkin belum ada — bukan error fatal
      console.warn('deleteUser storage warning:', storageErr);
    }

    // 3. Hapus sub-dokumen Firestore
    await deleteDoc(doc(db, 'users', username, 'weddingData', 'data'));
    await deleteDoc(doc(db, 'users', username, 'theme', 'data'));
    await deleteDoc(doc(db, 'users', username, 'live', 'data'));

    // 4. Hapus dokumen user utama
    await deleteDoc(doc(db, 'users', username));
  } catch (error) {
    console.error('deleteUser error:', error);
  }
}

export function subscribeUsers(callback: (users: AdminUser[]) => void): Unsubscribe {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snap) => {
      const users = snap.docs.map((d) => {
        const data = d.data();
        delete (data as any).username;
        return { ...data, username: d.id } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      console.error('subscribeUsers error:', error);
    }
  );
}

// ============================================================
// 7. AUTHENTICATION (username-based)
// ============================================================

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

// Alias untuk backward compatibility
export const getUsers = getAllUsers;
export const onUsersChange = subscribeUsers;
