import { create } from 'zustand';
import { WeddingData, Guest, AdminUser } from '../types';
import * as firebaseService from '../services/firebaseService';
import type { Unsubscribe } from 'firebase/firestore';

const defaultWeddingData: WeddingData = {
  groomName: '',
  brideName: '',
  groomFather: '',
  groomMother: '',
  brideFather: '',
  brideMother: '',
  groomParentsAddress: '',
  brideParentsAddress: '',
  weddingDate: '',
  weddingTime: '',
  weddingVenue: '',
  weddingAddress: '',
  receptionDate: '',
  receptionTime: '',
  receptionVenue: '',
  receptionAddress: '',
  mapLink: '',
  coverImage: '',
  groomPhoto: '',
  bridePhoto: '',
  couplePhoto: '',
  galleryImages: [],
  story: '',
  quote: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."',
  quoteSource: 'QS. Ar-Rum: 21',
  musicUrl: '',
  bankName: '',
  bankAccount: '',
  bankHolder: '',
  bankName2: '',
  bankAccount2: '',
  bankHolder2: '',
  greeting: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
  customFont: 'poppins',
};

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const debounce = (key: string, fn: () => void, delay = 800) => {
  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(fn, delay);
};

let activeUnsubscribers: Unsubscribe[] = [];

interface StoreState {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  users: AdminUser[];
  weddingDataMap: Record<string, WeddingData>;
  themeMap: Record<string, string>;
  guestsMap: Record<string, Guest[]>;
  liveMap: Record<string, boolean>;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  createUser: (user: Omit<AdminUser, 'createdAt' | 'isActive'>) => Promise<boolean>;
  updateUser: (username: string, data: Partial<AdminUser>) => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
  toggleUserActive: (username: string) => Promise<void>;
  resetUserPassword: (username: string, newPassword: string) => Promise<void>;

  getWeddingData: () => WeddingData;
  updateWeddingData: (data: Partial<WeddingData>) => void;

  getSelectedTheme: () => string;
  setSelectedTheme: (themeId: string) => Promise<void>;

  getGuests: () => Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => Promise<void>;
  addGuests: (guests: Omit<Guest, 'id' | 'createdAt'>[]) => Promise<void>;
  updateGuest: (id: string, data: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  clearAllGuests: () => Promise<void>;

  isLive: () => boolean;
  toggleLive: () => Promise<void>;

  getUserDisplayName: (username: string) => string;

  initializeFirebase: () => Promise<void>;
  setupUserListeners: (username: string) => void;
  cleanupUserListeners: () => void;
}

export const useStore = create<StoreState>()((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  users: [],
  weddingDataMap: {},
  themeMap: {},
  guestsMap: {},
  liveMap: {},
  isLoading: true,

  login: async (username, password) => {
    const { users } = get();
    const user = users.find(
      u => u.username === username && u.password === password
    );
    if (user && user.isActive) {
      set({ currentUser: user, isAuthenticated: true });
      get().setupUserListeners(username);
      return true;
    }
    return false;
  },

  logout: () => {
    get().cleanupUserListeners();
    set({
      currentUser: null,
      isAuthenticated: false,
      weddingDataMap: {},
      themeMap: {},
      guestsMap: {},
      liveMap: {},
    });
  },

  createUser: async (userData) => {
    const { users } = get();
    if (users.find(u => u.username === userData.username)) return false;

    const newUser: AdminUser = {
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    try {
      await firebaseService.createUser(newUser);
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  },

  updateUser: async (username, data) => {
    try {
      await firebaseService.updateUser(username, data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  deleteUser: async (username) => {
    try {
      await firebaseService.deleteUser(username);
      const { weddingDataMap, themeMap, guestsMap, liveMap } = get();
      const newWeddingData = { ...weddingDataMap };
      const newTheme = { ...themeMap };
      const newGuests = { ...guestsMap };
      const newLive = { ...liveMap };
      delete newWeddingData[username];
      delete newTheme[username];
      delete newGuests[username];
      delete newLive[username];
      set({
        weddingDataMap: newWeddingData,
        themeMap: newTheme,
        guestsMap: newGuests,
        liveMap: newLive,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  },

  toggleUserActive: async (username) => {
    try {
      await firebaseService.toggleUserActive(username);
    } catch (error) {
      console.error('Error toggling user active:', error);
    }
  },

  resetUserPassword: async (username, newPassword) => {
    try {
      await firebaseService.resetUserPassword(username, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  },

  getWeddingData: () => {
    const { currentUser, weddingDataMap } = get();
    if (!currentUser) return defaultWeddingData;
    return weddingDataMap[currentUser.username] || defaultWeddingData;
  },

  updateWeddingData: (data) => {
    const { currentUser, weddingDataMap } = get();
    if (!currentUser) return;

    const currentData =
      weddingDataMap[currentUser.username] || defaultWeddingData;
    const newData = { ...currentData, ...data };

    set({
      weddingDataMap: {
        ...weddingDataMap,
        [currentUser.username]: newData,
      },
    });

    debounce(`wedding-${currentUser.username}`, () => {
      firebaseService
        .saveWeddingData(currentUser.username, newData)
        .catch(err => console.error('Error saving wedding data:', err));
    });
  },

  getSelectedTheme: () => {
    const { currentUser, themeMap } = get();
    if (!currentUser) return 'elegant-gold';
    return themeMap[currentUser.username] || 'elegant-gold';
  },

  setSelectedTheme: async (themeId) => {
    const { currentUser, themeMap } = get();
    if (!currentUser) return;

    set({ themeMap: { ...themeMap, [currentUser.username]: themeId } });

    try {
      await firebaseService.saveTheme(currentUser.username, themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  getGuests: () => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return [];
    return guestsMap[currentUser.username] || [];
  },

  addGuest: async (guest) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await firebaseService.addGuest(currentUser.username, guest as any);
    } catch (error) {
      console.error('Error adding guest:', error);
    }
  },

  addGuests: async (newGuests) => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await firebaseService.addGuests(currentUser.username, newGuests as any);
    } catch (error) {
      console.error('Error adding guests:', error);
    }
  },

  updateGuest: async (id, data) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;

    const currentGuests = guestsMap[currentUser.username] || [];
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: currentGuests.map(g =>
          g.id === id ? { ...g, ...data } : g
        ),
      },
    });

    try {
      await firebaseService.updateGuest(currentUser.username, id, data);
    } catch (error) {
      console.error('Error updating guest:', error);
    }
  },

  deleteGuest: async (id) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;

    const currentGuests = guestsMap[currentUser.username] || [];
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: currentGuests.filter(g => g.id !== id),
      },
    });

    try {
      await firebaseService.deleteGuest(currentUser.username, id);
    } catch (error) {
      console.error('Error deleting guest:', error);
    }
  },

  clearAllGuests: async () => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;

    const currentGuests = guestsMap[currentUser.username] || [];
    set({ guestsMap: { ...guestsMap, [currentUser.username]: [] } });

    try {
      await Promise.all(
        currentGuests.map(g =>
          firebaseService.deleteGuest(currentUser.username, g.id)
        )
      );
    } catch (error) {
      console.error('Error clearing guests:', error);
    }
  },

  isLive: () => {
    const { currentUser, liveMap } = get();
    if (!currentUser) return false;
    return liveMap[currentUser.username] || false;
  },

  toggleLive: async () => {
    const { currentUser, liveMap } = get();
    if (!currentUser) return;

    const newStatus = !(liveMap[currentUser.username] || false);
    set({ liveMap: { ...liveMap, [currentUser.username]: newStatus } });

    try {
      await firebaseService.setLiveStatus(currentUser.username, newStatus);
    } catch (error) {
      console.error('Error toggling live status:', error);
    }
  },

  getUserDisplayName: (username) => {
    const { users } = get();
    return users.find(u => u.username === username)?.displayName || username;
  },

  initializeFirebase: async () => {
    try {
      const existingUsers = await firebaseService.getAllUsers();
      const adminExists = existingUsers.find(u => u.username === 'admin');

      if (!adminExists) {
        await firebaseService.createUser({
          username: 'admin',
          password: 'admin123',
          displayName: 'Super Admin',
          role: 'super-admin',
          createdAt: new Date().toISOString(),
          isActive: true,
        });
        console.log('Default admin created');
      }

      firebaseService.subscribeUsers((users) => {
        set({ users, isLoading: false });
      });
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      set({ isLoading: false });
    }
  },

  setupUserListeners: (username) => {
    console.log('Setup listener untuk:', username);
    get().cleanupUserListeners();

    const unsubWedding = firebaseService.subscribeWeddingData(
      username,
      (data) => {
        set((state) => ({
          weddingDataMap: { ...state.weddingDataMap, [username]: data },
        }));
      }
    );

    const unsubTheme = firebaseService.subscribeTheme(username, (themeId) => {
      set((state) => ({
        themeMap: { ...state.themeMap, [username]: themeId },
      }));
    });

    const unsubGuests = firebaseService.subscribeGuests(username, (guests) => {
      set((state) => ({
        guestsMap: { ...state.guestsMap, [username]: guests },
      }));
    });

    const unsubLive = firebaseService.subscribeLiveStatus(
      username,
      (isLive) => {
        set((state) => ({
          liveMap: { ...state.liveMap, [username]: isLive },
        }));
      }
    );

    activeUnsubscribers = [unsubWedding, unsubTheme, unsubGuests, unsubLive];
  },

  cleanupUserListeners: () => {
    if (activeUnsubscribers.length) {
      activeUnsubscribers.forEach((unsub) => unsub());
      activeUnsubscribers = [];
    }
  },
}));