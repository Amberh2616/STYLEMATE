import type { TrendDoc } from "./webSearch";

// —— 對齊你的 10 風格 —— //
const STYLE_MAP: Record<string, string> = {
  "quiet luxury": "極簡 (Minimalist)",
  "minimal|clean lines": "極簡 (Minimalist)",
  "french|paris|chic": "法式優雅 (French Chic)",
  "korean|seoul|han|clean layering": "清新韓系 (Fresh Korean)",
  "street|streetwear|hype": "街頭風 (Streetwear)",
  "office|workwear|tailored": "都會通勤 (Urban Office)",
  "american|preppy|varsity": "美式休閒 (American Casual)",
  "vintage|retro|y2k|70s|80s|90s": "復古懷舊 (Retro / Vintage)",
  "athleisure|sport|track|active": "機能運動 (Athleisure)",
  "glam|party|evening|sequins": "摩登華麗 (Glamorous)",
  "sweet|girly|coquette|bow|lace": "甜美少女 (Sweet / Girly)",
};

// —— 顏色/單品/材質 詞表（可擴充） —— //
const COLORS = [
  "silver", "metallic", "sage", "mint", "cherry red", "butter", "粉", "灰藍", "軍綠",
  "桃紅", "酒紅", "拿鐵", "奶油白", "炭灰", "靛藍", "薰衣草紫"
];
const ITEMS = [
  "mary jane", "kitten heel", "cargo", "blouson", "tube top", "polo", "loafer",
  "trench", "cardigan", "pleated skirt", "slip dress", "wide-leg pants"
];
const FABRICS = [
  "satin", "silk", "mesh", "denim", "crochet", "tweed", "sheer", "nylon", "linen", "wool"
];

export function normalizeTrends(docs: TrendDoc[]) {
  const text = (s: string) => (s || "").toLowerCase();

  const key_styles = uniq(docs.flatMap(d => {
    const t = text(`${d.title} ${d.snippet || ""}`);
    return Object.entries(STYLE_MAP).flatMap(([k, v]) => new RegExp(k).test(t) ? [v] : []);
  }));

  const key_colors = uniq(docs.flatMap(d => {
    const t = text(`${d.title} ${d.snippet || ""}`);
    return COLORS.filter(c => t.includes(c.toLowerCase()));
  }));

  const popular_items = uniq(docs.flatMap(d => {
    const t = text(`${d.title} ${d.snippet || ""}`);
    return ITEMS.filter(i => t.includes(i.toLowerCase()));
  }));

  const fabric_textures = uniq(docs.flatMap(d => {
    const t = text(`${d.title} ${d.snippet || ""}`);
    return FABRICS.filter(f => t.includes(f.toLowerCase()));
  }));

  const sources = uniq(docs.map(d => d.source));
  return { key_colors, key_styles, popular_items, fabric_textures, sources };
}

const uniq = <T,>(a: T[]) => Array.from(new Set(a)).slice(0, 20);