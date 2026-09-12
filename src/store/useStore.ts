import { create } from 'zustand';
import { WeddingData, Guest, AdminUser } from '../types';
import * as firebaseService from '../services/firebaseService';

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
  customFont: 'poppins'
};

interface StoreState {
  // Current logged in user
  currentUser: AdminUser | null;
  isAuthenticated: boolean;

  // All users (managed by super-admin)
  users: AdminUser[];

  // Per-user wedding data
  weddingDataMap: Record<string, WeddingData>;
  themeMap: Record<string, string>;
  guestsMap: Record<string, Guest[]>;
  liveMap: Record<string, boolean>;

  // Loading state
  isLoading: boolean;

  // Auth methods
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // User management (super-admin only)
  createUser: (user: Omit<AdminUser, 'createdAt' | 'isActive'>) => Promise<boolean>;
  updateUser: (username: string, data: Partial<AdminUser>) => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
  toggleUserActive: (username: string) => Promise<void>;
  resetUserPassword: (username: string, newPassword: string) => Promise<void>;

  // Wedding data methods (scoped to current user)
  getWeddingData: () => WeddingData;
  updateWeddingData: (data: Partial<WeddingData>) => Promise<void>;

  // Theme
  getSelectedTheme: () => string;
  setSelectedTheme: (themeId: string) => Promise<void>;

  // Guests (scoped to current user)
  getGuests: () => Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => Promise<void>;
  addGuests: (guests: Omit<Guest, 'id' | 'createdAt'>[]) => Promise<void>;
  updateGuest: (id: string, data: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  clearAllGuests: () => Promise<void>;

  // Live status
  isLive: () => boolean;
  toggleLive: () => Promise<void>;

  // Get user's display name (for invitation footer)
  getUserDisplayName: (username: string) => string;

  // Initialize Firebase listeners
  initializeFirebase: () => Promise<void>;
}

export const useStore = create<StoreState>()((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  users: [],
  weddingDataMap: {},
  themeMap: {},
  guestsMap: {},
  liveMap: {},
  isLoading: true,

  // Auth
  login: async (username: string, password: string) => {
    const { users } = get();
    const user = users.find(u => u.username === username && u.password === password);
    if (user && user.isActive) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null, isAuthenticated: false }),

  // User management
  createUser: async (userData) => {
    const { users } = get();
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
      return false;
    }
    const newUser: AdminUser = {
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    try {
      await firebaseService.addUser(newUser);
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
      // Also delete related data
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
        liveMap: newLive
      });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  },

  toggleUserActive: async (username) => {
    const { users } = get();
    const user = users.find(u => u.username === username);
    if (user) {
      try {
        await firebaseService.updateUser(username, { isActive: !user.isActive });
      } catch (error) {
        console.error('Error toggling user active:', error);
      }
    }
  },

  resetUserPassword: async (username, newPassword) => {
    try {
      await firebaseService.updateUser(username, { password: newPassword });
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  },

  // Wedding data (scoped)
  getWeddingData: () => {
    const { currentUser, weddingDataMap } = get();
    if (!currentUser) return defaultWeddingData;
    return weddingDataMap[currentUser.username] || defaultWeddingData;
  },

  updateWeddingData: async (data) => {
    const { currentUser, weddingDataMap } = get();
    if (!currentUser) return;
    const currentData = weddingDataMap[currentUser.username] || defaultWeddingData;
    const newData = { ...currentData, ...data };
    
    set({
      weddingDataMap: {
        ...weddingDataMap,
        [currentUser.username]: newData
      }
    });

    try {
      await firebaseService.saveWeddingData(currentUser.username, newData);
    } catch (error) {
      console.error('Error saving wedding data:', error);
    }
  },

  // Theme (scoped)
  getSelectedTheme: () => {
    const { currentUser, themeMap } = get();
    if (!currentUser) return 'elegant-gold';
    return themeMap[currentUser.username] || 'elegant-gold';
  },

  setSelectedTheme: async (themeId) => {
    const { currentUser, themeMap } = get();
    if (!currentUser) return;
    
    set({
      themeMap: { ...themeMap, [currentUser.username]: themeId }
    });

    try {
      await firebaseService.saveTheme(currentUser.username, themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  // Guests (scoped)
  getGuests: () => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return [];
    return guestsMap[currentUser.username] || [];
  },

  addGuest: async (guest) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    const currentGuests = guestsMap[currentUser.username] || [];
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: [...currentGuests, newGuest]
      }
    });

    try {
      await firebaseService.addGuest(currentUser.username, newGuest);
    } catch (error) {
      console.error('Error adding guest:', error);
    }
  },

  addGuests: async (newGuests) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    const currentGuests = guestsMap[currentUser.username] || [];
    const guestsWithIds = newGuests.map(g => ({
      ...g,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }));
    
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: [...currentGuests, ...guestsWithIds]
      }
    });

    try {
      for (const guest of guestsWithIds) {
        await firebaseService.addGuest(currentUser.username, guest);
      }
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
        [currentUser.username]: currentGuests.map(g => g.id === id ? { ...g, ...data } : g)
      }
    });

    try {
      await firebaseService.updateGuest(id, data);
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
        [currentUser.username]: currentGuests.filter(g => g.id !== id)
      }
    });

    try {
      await firebaseService.deleteGuest(id);
    } catch (error) {
      console.error('Error deleting guest:', error);
    }
  },

  clearAllGuests: async () => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    
    set({
      guestsMap: { ...guestsMap, [currentUser.username]: [] }
    });

    try {
      await firebaseService.deleteAllGuests(currentUser.username);
    } catch (error) {
      console.error('Error clearing guests:', error);
    }
  },

  // Live status (scoped)
  isLive: () => {
    const { currentUser, liveMap } = get();
    if (!currentUser) return false;
    return liveMap[currentUser.username] || false;
  },

  toggleLive: async () => {
    const { currentUser, liveMap } = get();
    if (!currentUser) return;
    const newStatus = !(liveMap[currentUser.username] || false);
    
    set({
      liveMap: {
        ...liveMap,
        [currentUser.username]: newStatus
      }
    });

    try {
      await firebaseService.saveLiveStatus(currentUser.username, newStatus);
    } catch (error) {
      console.error('Error toggling live status:', error);
    }
  },

  getUserDisplayName: (username: string) => {
    const { users } = get();
    const user = users.find(u => u.username === username);
    return user?.displayName || username;
  },

  // Initialize Firebase listeners
  initializeFirebase: async () => {
    try {
      // Check if admin user exists, if not create default admin
      const existingUsers = await firebaseService.getUsers();
      const adminExists = existingUsers.find(u => u.username === 'admin');
      
      if (!adminExists) {
        const defaultAdmin: AdminUser = {
          username: 'admin',
          password: 'admin123',
          displayName: 'Super Admin',
          role: 'super-admin',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        await firebaseService.addUser(defaultAdmin);
        console.log('Default admin user created');
      }

      // Listen to users changes (real-time)
      firebaseService.onUsersChange((users) => {
        set({ users, isLoading: false });
      });
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      set({ isLoading: false });
    }
  }
}));
