// frontend/store/outfitStore.ts
import { create } from 'zustand';
import type { Product } from '@/lib/products';

// LOOK 組合結構（支持洋裝單件或上下身組合）
export interface Look {
  id: number;
  items: Product[]; // 可以是 1 件洋裝 或 [上衣, 下身]
  style?: string;   // AI 生成的風格描述
  occasion?: string; // AI 生成的場合描述
}

// BE 27 三階段模式
export type BE27Mode = 'chat' | 'outfit' | 'tryon';

// 穿搭狀態介面
interface OutfitState {
  // === 模式控制 ===
  currentMode: BE27Mode;
  setMode: (mode: BE27Mode) => void;

  // === 商品池（1-12 件）===
  selectedProducts: Product[]; // 用戶選擇的所有商品
  setSelectedProducts: (products: Product[]) => void;

  // === LOOK 組合（6 套，AI 生成）===
  looks: Look[];
  setLooks: (looks: Look[]) => void;
  visibleLookCount: 3 | 6;
  setVisibleLookCount: (count: 3 | 6) => void;

  // === 試穿選擇 ===
  selectedLookForTryon: number | null;
  selectLookForTryon: (lookId: number) => void;

  // === 操作方法 ===
  swapItems: (
    lookId1: number,
    lookId2: number,
    itemType: 'top' | 'bottom'
  ) => void;

  replaceItem: (
    lookId: number,
    itemType: 'top' | 'bottom',
    newIndex: number
  ) => void;

  shuffleLooks: () => void;
  resetOutfit: () => void;
}

// 初始化 6 套 LOOK 組合（排列組合邏輯）
const initializeLooks = (): Look[] => {
  const combinations: Look[] = [];
  let id = 1;

  // 3 tops × 3 bottoms = 9 種組合，取前 6 種
  for (let t = 0; t < 3; t++) {
    for (let b = 0; b < 3; b++) {
      if (id <= 6) {
        combinations.push({ id, topIndex: t, bottomIndex: b });
        id++;
      }
    }
  }

  return combinations;
};

// 隨機打亂 LOOK 組合
const shuffleCombinations = (): Look[] => {
  const combinations: Look[] = [];
  const tops = [0, 1, 2];
  const bottoms = [0, 1, 2];

  // Fisher-Yates shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const shuffledTops = shuffleArray(tops);
  const shuffledBottoms = shuffleArray(bottoms);

  for (let i = 0; i < 6; i++) {
    combinations.push({
      id: i + 1,
      topIndex: shuffledTops[i % 3],
      bottomIndex: shuffledBottoms[i % 3]
    });
  }

  return combinations;
};

export const useOutfitStore = create<OutfitState>((set) => ({
  // === 初始狀態 ===
  currentMode: 'chat',
  selectedProducts: [],
  looks: [],
  visibleLookCount: 6,
  selectedLookForTryon: null,

  // === 模式控制 ===
  setMode: (mode) => set({ currentMode: mode }),

  // === 設定商品池 ===
  setSelectedProducts: (products) => {
    if (products.length < 1 || products.length > 12) {
      console.error('必須選擇 1-12 件商品');
      return;
    }
    set({
      selectedProducts: products,
      currentMode: 'outfit'
    });
  },

  // === 設定 LOOK 組合（由 API 生成）===
  setLooks: (looks) => set({ looks }),

  // === 顯示數量控制 ===
  setVisibleLookCount: (count) => set({ visibleLookCount: count }),

  // === 選擇試穿 LOOK ===
  selectLookForTryon: (lookId) => set({ selectedLookForTryon: lookId }),

  // === 交換商品（LOOK 之間） ===
  swapItems: (lookId1, lookId2, itemType) =>
    set((state) => {
      const look1 = state.looks.find((l) => l.id === lookId1);
      const look2 = state.looks.find((l) => l.id === lookId2);

      if (!look1 || !look2) {
        console.error('LOOK 不存在');
        return state;
      }

      // 找出要交換的商品（上衣或下身）
      const getItemByType = (look: Look, type: 'top' | 'bottom') => {
        if (look.items.length === 1) {
          // 洋裝的情況，直接返回
          return look.items[0];
        }
        // 上下身組合：items[0] 是上衣，items[1] 是下身
        return type === 'top' ? look.items[0] : look.items[1];
      };

      const item1 = getItemByType(look1, itemType);
      const item2 = getItemByType(look2, itemType);

      const newLooks = state.looks.map((look) => {
        if (look.id === lookId1) {
          const newItems = look.items.length === 1
            ? [item2]
            : itemType === 'top'
              ? [item2, look.items[1]]
              : [look.items[0], item2];
          return { ...look, items: newItems };
        }
        if (look.id === lookId2) {
          const newItems = look.items.length === 1
            ? [item1]
            : itemType === 'top'
              ? [item1, look.items[1]]
              : [look.items[0], item1];
          return { ...look, items: newItems };
        }
        return look;
      });

      return { looks: newLooks };
    }),

  // === 替換商品（指定新商品） ===
  replaceItem: (lookId, itemType, newIndex) =>
    set((state) => {
      const look = state.looks.find((l) => l.id === lookId);
      if (!look) {
        console.error('LOOK 不存在');
        return state;
      }

      // 從商品池中找到新商品（簡化版，實際需要根據類型篩選）
      const newProduct = state.selectedProducts[newIndex];
      if (!newProduct) {
        console.error('商品不存在');
        return state;
      }

      const newLooks = state.looks.map((l) => {
        if (l.id === lookId) {
          const newItems = l.items.length === 1
            ? [newProduct]
            : itemType === 'top'
              ? [newProduct, l.items[1]]
              : [l.items[0], newProduct];
          return { ...l, items: newItems };
        }
        return l;
      });

      return { looks: newLooks };
    }),

  // === 隨機重組全部 LOOK ===
  shuffleLooks: () =>
    set((state) => {
      // 隨機打亂現有的 looks
      const shuffled = [...state.looks].sort(() => Math.random() - 0.5);
      return { looks: shuffled };
    }),

  // === 重置穿搭狀態 ===
  resetOutfit: () =>
    set({
      currentMode: 'chat',
      selectedProducts: [],
      looks: [],
      visibleLookCount: 6,
      selectedLookForTryon: null
    })
}));

// === Helper Functions ===

// 取得 LOOK 的總價
export const getLookTotalPrice = (look: Look): number => {
  return look.items.reduce((sum, item) => sum + item.price, 0);
};

// 判斷 LOOK 是否為洋裝
export const isLookDress = (look: Look): boolean => {
  return look.items.length === 1 && look.items[0].category === '洋裝';
};

// 取得 LOOK 的上衣（如果有）
export const getLookTop = (look: Look): Product | null => {
  if (look.items.length === 1) return null; // 洋裝沒有單獨上衣
  return look.items[0]; // items[0] 是上衣
};

// 取得 LOOK 的下身（如果有）
export const getLookBottom = (look: Look): Product | null => {
  if (look.items.length === 1) return null; // 洋裝沒有單獨下身
  return look.items[1]; // items[1] 是下身
};

// 驗證商品池是否符合要求
export const validateProductPool = (
  products: Product[]
): { valid: boolean; error?: string } => {
  if (products.length < 1) {
    return { valid: false, error: '至少要選擇 1 件商品' };
  }
  if (products.length > 12) {
    return { valid: false, error: '最多只能選擇 12 件商品' };
  }

  return { valid: true };
};
