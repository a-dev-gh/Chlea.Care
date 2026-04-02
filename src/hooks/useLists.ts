import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocalList {
  id: string;
  name: string;
  items: string[]; // product IDs
  createdAt: string; // ISO date
}

interface ListsState {
  lists: LocalList[];
  isLoaded: boolean;

  // Actions
  createList: (name: string) => string;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  addToList: (listId: string, productId: string) => void;
  removeFromList: (listId: string, productId: string) => void;
  toggleInList: (listId: string, productId: string) => void;
  isInAnyList: (productId: string) => boolean;
  getListsContaining: (productId: string) => LocalList[];
}

// ---------------------------------------------------------------------------
// Helper: generate a default "Favoritos" list
// ---------------------------------------------------------------------------

function makeDefaultList(): LocalList {
  return {
    id: crypto.randomUUID(),
    name: 'Favoritos',
    items: [],
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLists = create<ListsState>()(
  persist(
    (set, get) => ({
      lists: [makeDefaultList()],
      isLoaded: true,

      createList: (name: string) => {
        const id = crypto.randomUUID();
        set(state => ({
          lists: [
            ...state.lists,
            { id, name, items: [], createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      renameList: (id, name) =>
        set(state => ({
          lists: state.lists.map(l => (l.id === id ? { ...l, name } : l)),
        })),

      deleteList: (id) =>
        set(state => ({
          lists: state.lists.filter(l => l.id !== id),
        })),

      addToList: (listId, productId) =>
        set(state => ({
          lists: state.lists.map(l =>
            l.id === listId && !l.items.includes(productId)
              ? { ...l, items: [...l.items, productId] }
              : l
          ),
        })),

      removeFromList: (listId, productId) =>
        set(state => ({
          lists: state.lists.map(l =>
            l.id === listId
              ? { ...l, items: l.items.filter(i => i !== productId) }
              : l
          ),
        })),

      toggleInList: (listId, productId) => {
        const list = get().lists.find(l => l.id === listId);
        if (!list) return;
        if (list.items.includes(productId)) {
          get().removeFromList(listId, productId);
        } else {
          get().addToList(listId, productId);
        }
      },

      isInAnyList: (productId) =>
        get().lists.some(l => l.items.includes(productId)),

      getListsContaining: (productId) =>
        get().lists.filter(l => l.items.includes(productId)),
    }),
    {
      name: 'chlea_lists',
      // Ensure default list exists after hydration
      onRehydrateStorage: () => (state) => {
        if (state && state.lists.length === 0) {
          state.lists = [makeDefaultList()];
        }
        if (state) {
          state.isLoaded = true;
        }
      },
    }
  )
);
