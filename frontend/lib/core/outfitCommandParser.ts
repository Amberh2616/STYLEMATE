// frontend/lib/core/outfitCommandParser.ts
import { useOutfitStore } from '@/store/outfitStore';

export type OutfitCommandType =
  | 'swap'           // 交換商品
  | 'replace'        // 替換商品
  | 'show_count'     // 顯示數量
  | 'shuffle'        // 重新組合
  | 'select_tryon'   // 選擇試穿
  | 'unknown';       // 無法識別

export interface OutfitCommand {
  type: OutfitCommandType;
  params: {
    lookId1?: number;
    lookId2?: number;
    itemType?: 'top' | 'bottom';
    newIndex?: number;
    count?: 3 | 6;
  };
  rawText: string;
  confidence: number; // 0-1 信心度
}

// === 正則表達式規則 ===

// LOOK 編號提取
const LOOK_NUMBER_REGEX = /LOOK\s*([1-6])|第\s*([一二三四五六1-6])\s*套|([1-6])\s*號/gi;

// 商品類型識別
const ITEM_TYPE_PATTERNS = {
  top: /上衣|上身|衣服|T恤|襯衫|外套|top|shirt/i,
  bottom: /褲子|下身|下裝|裙子|褲|pants|bottom|skirt/i
};

// 指令模式
const COMMAND_PATTERNS = {
  swap: /交換|換|互換|swap|exchange/i,
  replace: /替換|改成|換成|變成|replace|change/i,
  show_count: /只?顯示|只看|show|display/i,
  shuffle: /重新組合|隨機|打亂|重排|shuffle|random/i,
  select_tryon: /試穿|穿這套|看試穿|tryon|try on/i
};

// 數量識別
const COUNT_PATTERNS = {
  three: /3\s*套|三套|前\s*3|前三|three/i,
  six: /6\s*套|六套|全部|所有|all|six/i
};

// 中文數字轉換
const CHINESE_NUMBERS: { [key: string]: number } = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6
};

// === 提取 LOOK 編號 ===
function extractLookNumbers(text: string): number[] {
  const numbers: number[] = [];
  const matches = [...text.matchAll(LOOK_NUMBER_REGEX)];

  matches.forEach((match) => {
    const num = match[1] || match[2] || match[3];
    if (num) {
      if (CHINESE_NUMBERS[num]) {
        numbers.push(CHINESE_NUMBERS[num]);
      } else {
        const parsed = parseInt(num);
        if (parsed >= 1 && parsed <= 6) {
          numbers.push(parsed);
        }
      }
    }
  });

  return [...new Set(numbers)]; // 去重
}

// === 提取商品類型 ===
function extractItemType(text: string): 'top' | 'bottom' | undefined {
  if (ITEM_TYPE_PATTERNS.top.test(text)) return 'top';
  if (ITEM_TYPE_PATTERNS.bottom.test(text)) return 'bottom';
  return undefined;
}

// === 提取顯示數量 ===
function extractShowCount(text: string): 3 | 6 | undefined {
  if (COUNT_PATTERNS.three.test(text)) return 3;
  if (COUNT_PATTERNS.six.test(text)) return 6;
  return undefined;
}

// === 主解析函數 ===
export function parseOutfitCommand(text: string): OutfitCommand {
  const normalizedText = text.trim().toLowerCase();

  // 1. 檢測指令類型
  let type: OutfitCommandType = 'unknown';
  let confidence = 0;

  // 優先級：具體指令 > 模糊指令
  if (COMMAND_PATTERNS.select_tryon.test(normalizedText)) {
    type = 'select_tryon';
    confidence = 0.9;
  } else if (COMMAND_PATTERNS.shuffle.test(normalizedText)) {
    type = 'shuffle';
    confidence = 0.95;
  } else if (COMMAND_PATTERNS.show_count.test(normalizedText)) {
    type = 'show_count';
    confidence = 0.85;
  } else if (COMMAND_PATTERNS.swap.test(normalizedText)) {
    type = 'swap';
    confidence = 0.8;
  } else if (COMMAND_PATTERNS.replace.test(normalizedText)) {
    type = 'replace';
    confidence = 0.75;
  }

  // 2. 根據類型提取參數
  const params: OutfitCommand['params'] = {};

  switch (type) {
    case 'swap': {
      // 交換指令：需要 2 個 LOOK + 商品類型
      const lookNumbers = extractLookNumbers(text);
      const itemType = extractItemType(text);

      if (lookNumbers.length >= 2 && itemType) {
        params.lookId1 = lookNumbers[0];
        params.lookId2 = lookNumbers[1];
        params.itemType = itemType;
        confidence = 0.95;
      } else {
        confidence = 0.3; // 信心度降低
      }
      break;
    }

    case 'replace': {
      // 替換指令：需要 1 個 LOOK + 商品類型
      const lookNumbers = extractLookNumbers(text);
      const itemType = extractItemType(text);

      if (lookNumbers.length >= 1 && itemType) {
        params.lookId1 = lookNumbers[0];
        params.itemType = itemType;
        // 注意：這裡需要 LLM 進一步識別要替換成哪一件
        confidence = 0.7;
      } else {
        confidence = 0.3;
      }
      break;
    }

    case 'show_count': {
      const count = extractShowCount(text);
      if (count) {
        params.count = count;
        confidence = 0.9;
      } else {
        confidence = 0.4;
      }
      break;
    }

    case 'select_tryon': {
      const lookNumbers = extractLookNumbers(text);
      if (lookNumbers.length >= 1) {
        params.lookId1 = lookNumbers[0];
        confidence = 0.9;
      } else {
        confidence = 0.5;
      }
      break;
    }

    case 'shuffle': {
      // 無需額外參數
      confidence = 0.95;
      break;
    }

    default:
      confidence = 0;
  }

  return {
    type,
    params,
    rawText: text,
    confidence
  };
}

// === 執行指令 ===
export function executeOutfitCommand(command: OutfitCommand): {
  success: boolean;
  message: string;
} {
  const store = useOutfitStore.getState();

  // 信心度過低，拒絕執行
  if (command.confidence < 0.5) {
    return {
      success: false,
      message: '抱歉，我無法理解這個指令。可以試試：\n- "交換 LOOK 1 和 LOOK 3 的褲子"\n- "只顯示前 3 套"\n- "重新組合全部搭配"'
    };
  }

  try {
    switch (command.type) {
      case 'swap': {
        const { lookId1, lookId2, itemType } = command.params;
        if (!lookId1 || !lookId2 || !itemType) {
          return { success: false, message: '缺少必要參數' };
        }
        store.swapItems(lookId1, lookId2, itemType);
        return {
          success: true,
          message: `已交換 LOOK ${lookId1} 和 LOOK ${lookId2} 的${itemType === 'top' ? '上衣' : '褲子'}`
        };
      }

      case 'replace': {
        const { lookId1, itemType, newIndex } = command.params;
        if (!lookId1 || !itemType || newIndex === undefined) {
          return { success: false, message: '缺少必要參數' };
        }
        store.replaceItem(lookId1, itemType, newIndex);
        return {
          success: true,
          message: `已替換 LOOK ${lookId1} 的${itemType === 'top' ? '上衣' : '褲子'}`
        };
      }

      case 'show_count': {
        const { count } = command.params;
        if (!count) {
          return { success: false, message: '缺少顯示數量' };
        }
        store.setVisibleLookCount(count);
        return {
          success: true,
          message: `已切換為顯示 ${count} 套穿搭`
        };
      }

      case 'shuffle': {
        store.shuffleLooks();
        return {
          success: true,
          message: '已重新組合全部穿搭！'
        };
      }

      case 'select_tryon': {
        const { lookId1 } = command.params;
        if (!lookId1) {
          return { success: false, message: '請指定要試穿的 LOOK' };
        }
        store.selectLookForTryon(lookId1);
        store.setMode('tryon');
        return {
          success: true,
          message: `已選擇 LOOK ${lookId1} 進行試穿`
        };
      }

      default:
        return { success: false, message: '未知指令類型' };
    }
  } catch (error) {
    console.error('執行指令錯誤:', error);
    return {
      success: false,
      message: '執行指令時發生錯誤'
    };
  }
}

// === 測試用例 ===
export const TEST_COMMANDS = [
  '交換 LOOK 1 和 LOOK 3 的褲子',
  'LOOK 2 的上衣換成 LOOK 5 的上衣',
  '只顯示前 3 套',
  '顯示全部 6 套穿搭',
  '重新組合全部',
  '我要試穿 LOOK 4',
  '把第二套的下身換掉',
  '隨機排列'
];

// 開發環境測試
if (process.env.NODE_ENV === 'development') {
  // console.log('=== Outfit Command Parser Test ===');
  // TEST_COMMANDS.forEach((cmd) => {
  //   const result = parseOutfitCommand(cmd);
  //   console.log(`\n指令: ${cmd}`);
  //   console.log(`類型: ${result.type}`);
  //   console.log(`參數: ${JSON.stringify(result.params)}`);
  //   console.log(`信心度: ${result.confidence}`);
  // });
}
