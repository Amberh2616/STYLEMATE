// frontend/lib/core/intentRules.ts
export const MODE_KEYWORDS = {
  travel_plan: [
    // 只保留明確的旅行關鍵詞，移除容易誤判的模式
    /旅行|旅遊|出差|去[^\s]{1,10}玩|行程|幫我查天氣|天氣預報/i
  ],
  trend_summary: [
    // 優先匹配時裝週相關查詢
    /時裝周|fashion week|服裝周|時尚周|時尚週/i,
    /巴黎時裝周|紐約時裝周|米蘭時裝周|倫敦時裝周/i,
    /巴黎服裝周|紐約服裝周|米蘭服裝周|倫敦服裝周/i,
    /何時.*時裝周|什麼時候.*時裝周|時裝周.*何時|時裝周.*什麼時候/i,
    /fashion week.*when|when.*fashion week/i,
    /幾月.*時裝周|時裝周.*幾月/i,
    // 一般趨勢查詢
    /趨勢|流行|本季|今年|熱門|關鍵色|潮流|風格趨勢|時尚趨勢|色彩趨勢|流行色|搭配趨勢|穿搭趨勢|風格潮流|時髦|IN色|爆款|當季|新趨勢|時尚風向|街頭潮流|最新款|季節色彩|配色趨勢|材質趨勢|設計趨勢/i
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
  "New York, US","Los Angeles, US","Paris, FR","London, UK","Milan, IT",
  "Auckland, NZ","Wellington, NZ","Sydney, AU","Melbourne, AU","Berlin, DE",
  "Amsterdam, NL","Stockholm, SE","Copenhagen, DK","Zurich, CH","Vienna, AT",
  "Madrid, ES","Barcelona, ES","Rome, IT","Athens, GR","Moscow, RU",
  "Beijing, CN","Shanghai, CN","Mumbai, IN","Delhi, IN","Cairo, EG",
  "Dubai, AE","Tel Aviv, IL","Istanbul, TR","Mexico City, MX","São Paulo, BR",
  "Buenos Aires, AR","Santiago, CL","Lima, PE","Bogotá, CO","Caracas, VE",
  "Toronto, CA","Vancouver, CA","Montreal, CA","Lagos, NG","Johannesburg, ZA",
  "Nairobi, KE","Addis Ababa, ET","Jakarta, ID","Manila, PH","Ho Chi Minh City, VN"
];

// 國家名稱對應主要城市
export const COUNTRY_TO_CITY = {
  "韓國": "Seoul, KR",
  "日本": "Tokyo, JP", 
  "台灣": "Taipei, TW",
  "泰國": "Bangkok, TH",
  "新加坡": "Singapore, SG",
  "美國": "New York, US",
  "法國": "Paris, FR",
  "英國": "London, UK",
  "義大利": "Milan, IT",
  "紐西蘭": "Auckland, NZ",
  "澳洲": "Sydney, AU",
  "德國": "Berlin, DE",
  "荷蘭": "Amsterdam, NL",
  "瑞典": "Stockholm, SE",
  "丹麥": "Copenhagen, DK",
  "瑞士": "Zurich, CH",
  "奧地利": "Vienna, AT",
  "西班牙": "Madrid, ES",
  "希臘": "Athens, GR",
  "俄羅斯": "Moscow, RU",
  "中國": "Beijing, CN",
  "印度": "Mumbai, IN",
  "埃及": "Cairo, EG",
  "阿聯酋": "Dubai, AE",
  "以色列": "Tel Aviv, IL",
  "土耳其": "Istanbul, TR",
  "墨西哥": "Mexico City, MX",
  "巴西": "São Paulo, BR",
  "阿根廷": "Buenos Aires, AR",
  "智利": "Santiago, CL",
  "秘魯": "Lima, PE",
  "哥倫比亞": "Bogotá, CO",
  "委內瑞拉": "Caracas, VE",
  "加拿大": "Toronto, CA",
  "奈及利亞": "Lagos, NG",
  "南非": "Johannesburg, ZA",
  "肯亞": "Nairobi, KE",
  "衣索比亞": "Addis Ababa, ET",
  "印尼": "Jakarta, ID",
  "菲律賓": "Manila, PH",
  "越南": "Ho Chi Minh City, VN"
};