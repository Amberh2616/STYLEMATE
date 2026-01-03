// frontend/store/cartStore.ts
import { create } from 'zustand';
import type { Product } from '@/lib/products';
import type { Look } from './outfitStore';

// 購物車項目類型
export interface CartItem {
  id: string;                           // 唯一ID
  type: 'single' | 'outfit';            // 單品 or 整套

  // 單品模式
  product?: Product;
  quantity?: number;

  // 整套模式
  look?: Look;
  products?: Product[];                 // 整套的所有商品
  discountRate?: number;                // 套裝折扣 (0.9 = 9折)

  addedFrom: 'chat' | 'outfit' | 'tryon'; // 來源追蹤
  tryonImage?: string;                  // 試穿照片URL（如果有）
  addedAt: string;                      // 加入時間
}

interface CartState {
  items: CartItem[];

  // 加入單品
  addSingleProduct: (product: Product, quantity?: number, source?: 'chat' | 'outfit' | 'tryon') => void;

  // 加入整套 LOOK
  addOutfit: (look: Look, tryonImage?: string, source?: 'outfit' | 'tryon') => void;

  // 移除項目
  removeItem: (itemId: string) => void;

  // 更新單品數量
  updateQuantity: (itemId: string, quantity: number) => void;

  // 清空購物車
  clearCart: () => void;

  // 計算總價
  getTotalPrice: () => number;

  // 計算總商品數
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // 加入單品
  addSingleProduct: (product, quantity = 1, source = 'chat') => {
    set((state) => {
      // 檢查是否已存在相同商品
      const existingIndex = state.items.findIndex(
        (item) => item.type === 'single' && item.product?.id === product.id
      );

      if (existingIndex >= 0) {
        // 如果已存在，增加數量
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: (newItems[existingIndex].quantity || 1) + quantity
        };
        return { items: newItems };
      } else {
        // 新增項目
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'single',
          product,
          quantity,
          addedFrom: source,
          addedAt: new Date().toISOString()
        };
        return { items: [...state.items, newItem] };
      }
    });
  },

  // 加入整套 LOOK
  addOutfit: (look, tryonImage, source = 'outfit') => {
    set((state) => {
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'outfit',
        look,
        products: look.items,
        discountRate: 0.95, // 預設套裝95折
        addedFrom: source,
        tryonImage,
        addedAt: new Date().toISOString()
      };
      return { items: [...state.items, newItem] };
    });
  },

  // 移除項目
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId)
    }));
  },

  // 更新單品數量
  updateQuantity: (itemId, quantity) => {
    set((state) => {
      const newItems = state.items.map((item) => {
        if (item.id === itemId && item.type === 'single') {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      });
      return { items: newItems };
    });
  },

  // 清空購物車
  clearCart: () => set({ items: [] }),

  // 計算總價
  getTotalPrice: () => {
    const state = get();
    return state.items.reduce((total, item) => {
      if (item.type === 'single' && item.product) {
        return total + item.product.price * (item.quantity || 1);
      } else if (item.type === 'outfit' && item.products) {
        const outfitTotal = item.products.reduce((sum, p) => sum + p.price, 0);
        const discount = item.discountRate || 1;
        return total + outfitTotal * discount;
      }
      return total;
    }, 0);
  },

  // 計算總商品數
  getTotalItems: () => {
    const state = get();
    return state.items.reduce((total, item) => {
      if (item.type === 'single') {
        return total + (item.quantity || 1);
      } else if (item.type === 'outfit') {
        return total + 1; // 整套算1件
      }
      return total;
    }, 0);
  }
}));

// Helper: 取得單一商品的價格
export const getItemPrice = (item: CartItem): number => {
  if (item.type === 'single' && item.product) {
    return item.product.price * (item.quantity || 1);
  } else if (item.type === 'outfit' && item.products) {
    const total = item.products.reduce((sum, p) => sum + p.price, 0);
    return total * (item.discountRate || 1);
  }
  return 0;
};

// Helper: 取得購物車摘要文字
export const getCartSummary = (items: CartItem[]): string => {
  const count = items.length;
  if (count === 0) return '購物車是空的';
  if (count === 1) return '1 件商品';
  return `${count} 件商品`;
};
