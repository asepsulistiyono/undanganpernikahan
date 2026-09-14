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

// Debounce helper
const debounceTimers: Record<string, NodeJS.Timeout> = {};
const debounce = (key: string, fn: () => void, delay: number = 1000) => {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }
  debounceTimers[key] = setTimeout(fn, delay);
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
  updateWeddingData: (data: Partial<WeddingData>) => void;

  // Theme
  getSelectedTheme: () => string;
  setSelectedTheme: (themeId: string) => void;

  // Guests (scoped to current user)
  getGuests: () => Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => void;
  addGuests: (guests: Omit<Guest, 'id' | 'createdAt'>[]) => void;
  updateGuest: (id: string, data: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  clearAllGuests: () => void;

  // Live status
  isLive: () => boolean;
  toggleLive: () => void;

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

  // Wedding data (scoped) - OPTIMIZED WITH DEBOUNCE
  getWeddingData: () => {
  const username = get().currentUser?.username;
  const data = get().weddingDataMap[username];
  console.log('📖 getWeddingData dipanggil:', username, '→', data ? 'ADA' : 'KOSONG');
  return data || DEFAULT_WEDDING_DATA;
  },

  updateWeddingData: (data) => {
    const { currentUser, weddingDataMap } = get();
    if (!currentUser) return;
    const currentData = weddingDataMap[currentUser.username] || defaultWeddingData;
    const newData = { ...currentData, ...data };
    
    console.log('Updating wedding data:', { username: currentUser.username, field: Object.keys(data)[0], value: Object.values(data)[0] });
    console.log('New data bridePhoto:', newData.bridePhoto);
    console.log('New data groomPhoto:', newData.groomPhoto);
    
    // Optimistic update - update UI immediately
    set({
      weddingDataMap: {
        ...weddingDataMap,
        [currentUser.username]: newData
      }
    });

    // Debounced save to Firebase (1 second delay)
    debounce(`wedding-${currentUser.username}`, () => {
      console.log('Saving to Firebase:', { username: currentUser.username, bridePhoto: newData.bridePhoto, groomPhoto: newData.groomPhoto });
      firebaseService.saveWeddingData(currentUser.username, newData)
        .then(() => console.log('Successfully saved to Firebase'))
        .catch(error => console.error('Error saving wedding data:', error));
    }, 1000);
  },

  // Theme (scoped) - OPTIMIZED
  getSelectedTheme: () => {
    const { currentUser, themeMap } = get();
    if (!currentUser) return 'elegant-gold';
    return themeMap[currentUser.username] || 'elegant-gold';
  },

  setSelectedTheme: (themeId) => {
    const { currentUser, themeMap } = get();
    if (!currentUser) return;
    
    // Optimistic update
    set({
      themeMap: { ...themeMap, [currentUser.username]: themeId }
    });

    // Fire and forget
    firebaseService.saveTheme(currentUser.username, themeId)
      .catch(error => console.error('Error saving theme:', error));
  },

  // Guests (scoped) - OPTIMIZED
  getGuests: () => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return [];
    return guestsMap[currentUser.username] || [];
  },

  addGuest: (guest) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    const currentGuests = guestsMap[currentUser.username] || [];
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    // Optimistic update
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: [...currentGuests, newGuest]
      }
    });

    // Fire and forget
    firebaseService.addGuest(currentUser.username, newGuest)
      .catch(error => console.error('Error adding guest:', error));
  },

  addGuests: (newGuests) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    const currentGuests = guestsMap[currentUser.username] || [];
    const guestsWithIds = newGuests.map(g => ({
      ...g,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }));
    
    // Optimistic update
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: [...currentGuests, ...guestsWithIds]
      }
    });

    // Batch save to Firebase
    Promise.all(guestsWithIds.map(guest => 
      firebaseService.addGuest(currentUser.username, guest)
    )).catch(error => console.error('Error adding guests:', error));
  },

  updateGuest: (id, data) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    const currentGuests = guestsMap[currentUser.username] || [];
    
    // Optimistic update
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: currentGuests.map(g => g.id === id ? { ...g, ...data } : g)
      }
    });

    // Fire and forget
    firebaseService.updateGuest(id, data)
      .catch(error => console.error('Error updating guest:', error));
  },

  deleteGuest: (id) => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    const currentGuests = guestsMap[currentUser.username] || [];
    
    // Optimistic update
    set({
      guestsMap: {
        ...guestsMap,
        [currentUser.username]: currentGuests.filter(g => g.id !== id)
      }
    });

    // Fire and forget
    firebaseService.deleteGuest(id)
      .catch(error => console.error('Error deleting guest:', error));
  },

  clearAllGuests: () => {
    const { currentUser, guestsMap } = get();
    if (!currentUser) return;
    
    // Optimistic update
    set({
      guestsMap: { ...guestsMap, [currentUser.username]: [] }
    });

    // Fire and forget
    firebaseService.deleteAllGuests(currentUser.username)
      .catch(error => console.error('Error clearing guests:', error));
  },

  // Live status (scoped) - OPTIMIZED
  isLive: () => {
    const { currentUser, liveMap } = get();
    if (!currentUser) return false;
    return liveMap[currentUser.username] || false;
  },

  toggleLive: () => {
    const { currentUser, liveMap } = get();
    if (!currentUser) return;
    const newStatus = !(liveMap[currentUser.username] || false);
    
    // Optimistic update
    set({
      liveMap: {
        ...liveMap,
        [currentUser.username]: newStatus
      }
    });

    // Fire and forget
    firebaseService.saveLiveStatus(currentUser.username, newStatus)
      .catch(error => console.error('Error toggling live status:', error));
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
