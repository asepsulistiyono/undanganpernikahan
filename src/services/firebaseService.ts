import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { AdminUser, WeddingData, Guest } from '../types';

const storage = getStorage();

// Upload image to Firebase Storage and return URL
export const uploadImage = async (base64Image: string, username: string, imageName: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `wedding-images/${username}/${imageName}_${Date.now()}.jpg`);
    await uploadString(storageRef, base64Image, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Users Collection
const USERS_COLLECTION = 'users';
const WEDDING_DATA_COLLECTION = 'weddingData';
const GUESTS_COLLECTION = 'guests';
const THEMES_COLLECTION = 'themes';
const LIVE_STATUS_COLLECTION = 'liveStatus';

// Users
export const getUsers = async (): Promise<AdminUser[]> => {
  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  return snapshot.docs.map(doc => doc.data() as AdminUser);
};

export const addUser = async (user: AdminUser): Promise<void> => {
  await setDoc(doc(db, USERS_COLLECTION, user.username), user);
};

export const updateUser = async (username: string, data: Partial<AdminUser>): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, username), data as any);
};

export const deleteUser = async (username: string): Promise<void> => {
  await deleteDoc(doc(db, USERS_COLLECTION, username));
};

export const onUsersChange = (callback: (users: AdminUser[]) => void): Unsubscribe => {
  return onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as AdminUser);
    callback(users);
  });
};

// Wedding Data
export const getWeddingData = async (username: string): Promise<WeddingData | null> => {
  const docRef = doc(db, WEDDING_DATA_COLLECTION, username);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as WeddingData;
  }
  return null;
};

export const saveWeddingData = async (username: string, data: WeddingData): Promise<void> => {
  console.log('Firebase saveWeddingData called for user:', username);
  console.log('Bride photo length:', data.bridePhoto?.length || 0);
  console.log('Groom photo length:', data.groomPhoto?.length || 0);

  // Calculate total document size (approximate)
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonString]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  console.log('Document size:', sizeInKB, 'KB');

  // Firestore has a 1MB limit per document
  if (sizeInBytes > 900 * 1024) { // 900KB to be safe
    console.warn('Document size is close to Firestore limit (1MB). Images may be too large.');
  }

  try {
    await setDoc(doc(db, WEDDING_DATA_COLLECTION, username), data);
    console.log('Firebase saveWeddingData completed successfully');
  } catch (error) {
    console.error('Firebase saveWeddingData error:', error);
    throw error;
  }
};

export const onWeddingDataChange = (username: string, callback: (data: WeddingData | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, WEDDING_DATA_COLLECTION, username), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as WeddingData);
    } else {
      callback(null);
    }
  });
};

// Guests
export const getGuests = async (username: string): Promise<Guest[]> => {
  const q = query(collection(db, GUESTS_COLLECTION), where('ownerUsername', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Guest);
};

export const addGuest = async (username: string, guest: Guest): Promise<void> => {
  await setDoc(doc(db, GUESTS_COLLECTION, guest.id), {
    ...guest,
    ownerUsername: username
  });
};

export const updateGuest = async (guestId: string, data: Partial<Guest>): Promise<void> => {
  await updateDoc(doc(db, GUESTS_COLLECTION, guestId), data as any);
};

export const deleteGuest = async (guestId: string): Promise<void> => {
  await deleteDoc(doc(db, GUESTS_COLLECTION, guestId));
};

export const deleteAllGuests = async (username: string): Promise<void> => {
  const q = query(collection(db, GUESTS_COLLECTION), where('ownerUsername', '==', username));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const onGuestsChange = (username: string, callback: (guests: Guest[]) => void): Unsubscribe => {
  const q = query(collection(db, GUESTS_COLLECTION), where('ownerUsername', '==', username));
  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map(doc => doc.data() as Guest);
    callback(guests);
  });
};

// Theme
export const getTheme = async (username: string): Promise<string> => {
  const docRef = doc(db, THEMES_COLLECTION, username);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data?.theme || 'elegant-gold';
  }
  return 'elegant-gold';
};

export const saveTheme = async (username: string, theme: string): Promise<void> => {
  await setDoc(doc(db, THEMES_COLLECTION, username), { theme });
};

export const onThemeChange = (username: string, callback: (theme: string) => void): Unsubscribe => {
  return onSnapshot(doc(db, THEMES_COLLECTION, username), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data()?.theme || 'elegant-gold');
    } else {
      callback('elegant-gold');
    }
  });
};

// Live Status
export const getLiveStatus = async (username: string): Promise<boolean> => {
  const docRef = doc(db, LIVE_STATUS_COLLECTION, username);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data?.isLive || false;
  }
  return false;
};

export const saveLiveStatus = async (username: string, isLive: boolean): Promise<void> => {
  await setDoc(doc(db, LIVE_STATUS_COLLECTION, username), { isLive });
};

export const onLiveStatusChange = (username: string, callback: (isLive: boolean) => void): Unsubscribe => {
  return onSnapshot(doc(db, LIVE_STATUS_COLLECTION, username), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data()?.isLive || false);
    } else {
      callback(false);
    }
  });
};
