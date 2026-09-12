import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeddingData, Guest, AdminUser } from '../types';

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

  // Auth methods
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // User management (super-admin only)
  createUser: (user: Omit<AdminUser, 'createdAt' | 'isActive'>) => boolean;
  updateUser: (username: string, data: Partial<AdminUser>) => void;
  deleteUser: (username: string) => void;
  toggleUserActive: (username: string) => void;
  resetUserPassword: (username: string, newPassword: string) => void;

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
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,

      // Super admin + initial users
      users: [
        {
          username: 'admin',
          password: 'admin123',
          displayName: 'Super Admin',
          role: 'super-admin',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ],

      weddingDataMap: {},
      themeMap: {},
      guestsMap: {},
      liveMap: {},

      // Auth
      login: (username: string, password: string) => {
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
      createUser: (userData) => {
        const { users } = get();
        // Check if username already exists
        if (users.find(u => u.username === userData.username)) {
          return false;
        }
        const newUser: AdminUser = {
          ...userData,
          role: 'user',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        set({ users: [...users, newUser] });
        return true;
      },

      updateUser: (username, data) => {
        const { users } = get();
        set({
          users: users.map(u => u.username === username ? { ...u, ...data } : u)
        });
      },

      deleteUser: (username) => {
        const { users, weddingDataMap, themeMap, guestsMap, liveMap } = get();
        const newWeddingData = { ...weddingDataMap };
        const newTheme = { ...themeMap };
        const newGuests = { ...guestsMap };
        const newLive = { ...liveMap };
        delete newWeddingData[username];
        delete newTheme[username];
        delete newGuests[username];
        delete newLive[username];
        set({
          users: users.filter(u => u.username !== username),
          weddingDataMap: newWeddingData,
          themeMap: newTheme,
          guestsMap: newGuests,
          liveMap: newLive
        });
      },

      toggleUserActive: (username) => {
        const { users } = get();
        set({
          users: users.map(u => u.username === username ? { ...u, isActive: !u.isActive } : u)
        });
      },

      resetUserPassword: (username, newPassword) => {
        const { users } = get();
        set({
          users: users.map(u => u.username === username ? { ...u, password: newPassword } : u)
        });
      },

      // Wedding data (scoped)
      getWeddingData: () => {
        const { currentUser, weddingDataMap } = get();
        if (!currentUser) return defaultWeddingData;
        return weddingDataMap[currentUser.username] || defaultWeddingData;
      },

      updateWeddingData: (data) => {
        const { currentUser, weddingDataMap } = get();
        if (!currentUser) return;
        const currentData = weddingDataMap[currentUser.username] || defaultWeddingData;
        set({
          weddingDataMap: {
            ...weddingDataMap,
            [currentUser.username]: { ...currentData, ...data }
          }
        });
      },

      // Theme (scoped)
      getSelectedTheme: () => {
        const { currentUser, themeMap } = get();
        if (!currentUser) return 'elegant-gold';
        return themeMap[currentUser.username] || 'elegant-gold';
      },

      setSelectedTheme: (themeId) => {
        const { currentUser, themeMap } = get();
        if (!currentUser) return;
        set({
          themeMap: { ...themeMap, [currentUser.username]: themeId }
        });
      },

      // Guests (scoped)
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
        set({
          guestsMap: {
            ...guestsMap,
            [currentUser.username]: [...currentGuests, newGuest]
          }
        });
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
        set({
          guestsMap: {
            ...guestsMap,
            [currentUser.username]: [...currentGuests, ...guestsWithIds]
          }
        });
      },

      updateGuest: (id, data) => {
        const { currentUser, guestsMap } = get();
        if (!currentUser) return;
        const currentGuests = guestsMap[currentUser.username] || [];
        set({
          guestsMap: {
            ...guestsMap,
            [currentUser.username]: currentGuests.map(g => g.id === id ? { ...g, ...data } : g)
          }
        });
      },

      deleteGuest: (id) => {
        const { currentUser, guestsMap } = get();
        if (!currentUser) return;
        const currentGuests = guestsMap[currentUser.username] || [];
        set({
          guestsMap: {
            ...guestsMap,
            [currentUser.username]: currentGuests.filter(g => g.id !== id)
          }
        });
      },

      clearAllGuests: () => {
        const { currentUser, guestsMap } = get();
        if (!currentUser) return;
        set({
          guestsMap: { ...guestsMap, [currentUser.username]: [] }
        });
      },

      // Live status (scoped)
      isLive: () => {
        const { currentUser, liveMap } = get();
        if (!currentUser) return false;
        return liveMap[currentUser.username] || false;
      },

      toggleLive: () => {
        const { currentUser, liveMap } = get();
        if (!currentUser) return;
        set({
          liveMap: {
            ...liveMap,
            [currentUser.username]: !(liveMap[currentUser.username] || false)
          }
        });
      },

      getUserDisplayName: (username: string) => {
        const { users } = get();
        const user = users.find(u => u.username === username);
        return user?.displayName || username;
      }
    }),
    {
      name: 'wedding-invitation-storage-v2'
    }
  )
);
