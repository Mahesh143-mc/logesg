import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AppState {
  user: User | null;
  profile: any | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  currentAdminPage: string;
  setCurrentAdminPage: (page: string) => void;
  currentCustomerPage: string;
  setCurrentCustomerPage: (page: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  urlMode: 'standard' | 'static';
  setUrlMode: (mode: 'standard' | 'static') => void;
  cart: any[];
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItem: (productId: string, updates: any) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  currentAdminPage: 'dashboard',
  setCurrentAdminPage: (page) => set({ currentAdminPage: page }),
  currentCustomerPage: 'home',
  setCurrentCustomerPage: (page) => set({ currentCustomerPage: page }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  urlMode: 'static',
  setUrlMode: (mode) => set({ urlMode: mode }),
  cart: [],
  isCartOpen: false,
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find((item) => item.id === product.id);
    if (existingItem) {
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
        isCartOpen: true,
      };
    }
    return { 
      cart: [...state.cart, { ...product, quantity: product.quantity || 1 }],
      isCartOpen: true,
    };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId),
  })),
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ),
  })),
  updateCartItem: (productId, updates) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === productId ? { ...item, ...updates } : item
    ),
  })),
  clearCart: () => set({ cart: [] }),
}));
