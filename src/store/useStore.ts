import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeddingData, Guest, AdminUser } from '../types';

const defaultWeddingData: WeddingData = {
  groomName: 'Ahmad Fauzan',
  brideName: 'Siti Nurhaliza',
  groomFather: 'H. Muhammad Rizki',
  groomMother: 'Hj. Fatimah Az-Zahra',
  brideFather: 'H. Abdullah Hakim',
  brideMother: 'Hj. Aisyah Putri',
  groomParentsAddress: 'Jl. Mawar No. 10, Jakarta Selatan',
  brideParentsAddress: 'Jl. Melati No. 25, Jakarta Timur',
  weddingDate: '2025-06-15',
  weddingTime: '08:00',
  weddingVenue: 'Masjid Istiqlal',
  weddingAddress: 'Jl. Taman Wijaya Kusuma, Jakarta Pusat',
  receptionDate: '2025-06-15',
  receptionTime: '11:00',
  receptionVenue: 'Ballroom Hotel Mulia',
  receptionAddress: 'Jl. Asia Afrika, Senayan, Jakarta Selatan',
  mapLink: 'https://maps.google.com',
  coverImage: '',
  groomPhoto: '',
  bridePhoto: '',
  couplePhoto: '',
  galleryImages: [],
  story: 'Pertemuan kami dimulai dari sebuah kebetulan yang indah. Dari saling mengenal, kami menemukan bahwa kami saling melengkapi dalam setiap aspek kehidupan.',
  quote: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya."',
  quoteSource: 'QS. Ar-Rum: 21',
  musicUrl: '',
  bankName: 'Bank Central Asia',
  bankAccount: '1234567890',
  bankHolder: 'Ahmad Fauzan',
  bankName2: 'Bank Mandiri',
  bankAccount2: '0987654321',
  bankHolder2: 'Siti Nurhaliza',
  greeting: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
  customFont: 'poppins'
};

interface StoreState {
  // Auth
  adminUser: AdminUser;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateAdminUser: (user: Partial<AdminUser>) => void;

  // Wedding Data
  weddingData: WeddingData;
  updateWeddingData: (data: Partial<WeddingData>) => void;

  // Theme
  selectedTheme: string;
  setSelectedTheme: (themeId: string) => void;

  // Guests
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => void;
  addGuests: (guests: Omit<Guest, 'id' | 'createdAt'>[]) => void;
  updateGuest: (id: string, data: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  clearAllGuests: () => void;

  // Status
  isLive: boolean;
  toggleLive: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      adminUser: {
        username: 'admin',
        password: 'admin123',
        displayName: 'Administrator'
      },
      isAuthenticated: false,
      login: (username: string, password: string) => {
        const { adminUser } = get();
        if (username === adminUser.username && password === adminUser.password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
      updateAdminUser: (user) => {
        const { adminUser } = get();
        set({ adminUser: { ...adminUser, ...user } });
      },

      // Wedding Data
      weddingData: defaultWeddingData,
      updateWeddingData: (data) => {
        const { weddingData } = get();
        set({ weddingData: { ...weddingData, ...data } });
      },

      // Theme
      selectedTheme: 'elegant-gold',
      setSelectedTheme: (themeId) => set({ selectedTheme: themeId }),

      // Guests
      guests: [],
      addGuest: (guest) => {
        const { guests } = get();
        const newGuest: Guest = {
          ...guest,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        set({ guests: [...guests, newGuest] });
      },
      addGuests: (newGuests) => {
        const { guests } = get();
        const guestsWithIds = newGuests.map(g => ({
          ...g,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        }));
        set({ guests: [...guests, ...guestsWithIds] });
      },
      updateGuest: (id, data) => {
        const { guests } = get();
        set({ guests: guests.map(g => g.id === id ? { ...g, ...data } : g) });
      },
      deleteGuest: (id) => {
        const { guests } = get();
        set({ guests: guests.filter(g => g.id !== id) });
      },
      clearAllGuests: () => set({ guests: [] }),

      // Status
      isLive: false,
      toggleLive: () => set({ isLive: !get().isLive })
    }),
    {
      name: 'wedding-invitation-storage'
    }
  )
);
