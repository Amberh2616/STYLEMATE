// frontend/lib/core/intentRules.ts
export const MODE_KEYWORDS = {
  travel_plan: [
    // 只保留明確的旅行關鍵詞，移除容易誤判的模式
    /旅行|旅遊|出差|去[^\s]{1,10}玩|行程|幫我查天氣|天氣預報/i
  ],
  trend_summary: [
    // 優先匹配時裝週相關查詢
    /時裝周|fashion week/i,
    /巴黎時裝周|紐約時裝周|米蘭時裝周|倫敦時裝周/i,
    /何時.*時裝周|什麼時候.*時裝周|時裝周.*何時|時裝周.*什麼時候/i,
    /fashion week.*when|when.*fashion week/i,
    /幾月.*時裝周|時裝周.*幾月/i,
    // 一般趨勢查詢
    /趨勢|流行|本季|今年|熱門|關鍵色/i
  ],
  rerank: [
    /重排|rerank|這幾件|幫我排序|top\s*\d+/i
  ]
};

export const OCCASION_HINTS = [
  { rx: /婚禮|wedding|喜宴/i, val: "正式" },
  { rx: /面試|interview/i, val: "正式" },
  { rx: /通勤|上班|office/i, val: "通勤" },
  { rx: /約會|date/i, val: "約會" },
  { rx: /旅遊|旅行|trip|tour/i, val: "旅遊" },
  { rx: /派對|party/i, val: "派對" },
  { rx: /簡報|presentation/i, val: "商務簡報" }
];

export const NEEDS_RAG_HINTS = [
  /婚禮|宗教|教堂|寺廟|禮儀|dress\s*code|黑領帶|black\s*tie|business\s*casual/i,
  /材質|麂皮|絲綢|防水|防滑|鞋跟|鞋底/i
];

export const CITY_WHITELIST = [
  "Tokyo, JP","Osaka, JP","Kyoto, JP","Seoul, KR","Busan, KR","Taipei, TW",
  "Taichung, TW","Kaohsiung, TW","Hong Kong, HK","Bangkok, TH","Singapore, SG",
  "New York, US","Los Angeles, US","Paris, FR","London, UK","Milan, IT"
];