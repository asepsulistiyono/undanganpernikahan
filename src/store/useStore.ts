// src/store/useStore.ts
import { create } from 'zustand';
import * as firebaseService from '../services/firebaseService';

export const useStore = create<Store>((set, get) => ({
  // ... state lain

  updateWeddingData: async (data) => {
    const username = get().currentUser?.username;
    if (!username) return;

    // 1. Update local dulu (optimistic)
    set(state => ({
      weddingDataMap: {
        ...state.weddingDataMap,
        [username]: {
          ...state.weddingDataMap[username],
          ...data,
        },
      },
    }));

    // 2. 🔥 SYNC KE FIREBASE
    try {
      await firebaseService.saveWeddingData(username, data);
    } catch (e) {
      console.error('❌ Gagal sync ke Firebase:', e);
    }
  },

  addGuest: async (guest) => {
    const username = get().currentUser?.username;
    if (!username) return;

    // 🔥 Simpan ke Firebase dulu
    const guestId = await firebaseService.addGuest(username, guest);

    // Update lokal dengan id dari Firebase
    set(state => ({
      guestsMap: {
        ...state.guestsMap,
        [username]: [
          { id: guestId, ...guest, createdAt: new Date() },
          ...(state.guestsMap[username] || []),
        ],
      },
    }));
  },

  updateGuest: async (id, data) => {
    const username = get().currentUser?.username;
    if (!username) return;

    set(state => ({
      guestsMap: {
        ...state.guestsMap,
        [username]: state.guestsMap[username].map(g =>
          g.id === id ? { ...g, ...data } : g
        ),
      },
    }));

    // 🔥 Sync ke Firebase
    await firebaseService.updateGuest(username, id, data);
  },

  deleteGuest: async (id) => {
    const username = get().currentUser?.username;
    if (!username) return;

    set(state => ({
      guestsMap: {
        ...state.guestsMap,
        [username]: state.guestsMap[username].filter(g => g.id !== id),
      },
    }));

    // 🔥 Sync ke Firebase
    await firebaseService.deleteGuest(username, id);
  },

  toggleLive: async () => {
    const username = get().currentUser?.username;
    if (!username) return;
    const newStatus = !get().isLive();

    // 🔥 Sync ke Firebase
    await firebaseService.setLiveStatus(username, newStatus);
  },

  setSelectedTheme: async (themeId) => {
    const username = get().currentUser?.username;
    if (!username) return;

    // 🔥 Sync ke Firebase
    await firebaseService.saveTheme(username, themeId);
  },

  addGuests: async (guests) => {
    const username = get().currentUser?.username;
    if (!username) return;
    await firebaseService.addGuests(username, guests);
  },
}));
