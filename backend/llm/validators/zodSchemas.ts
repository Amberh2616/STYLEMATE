import { z } from "zod";

// ===== Common Types =====
const OccasionZ = z.enum(["通勤","正式","休閒","約會","旅遊","商務簡報","派對"]);
const StyleKeywordZ = z.enum([
  "清新韓系 (Fresh Korean)",
  "法式優雅 (French Chic)",
  "極簡 (Minimalist)",
  "甜美少女 (Sweet / Girly)",
  "街頭風 (Streetwear)",
  "都會通勤 (Urban Office)",
  "美式休閒 (American Casual)",
  "復古懷舊 (Retro / Vintage)",
  "機能運動 (Athleisure)",
  "摩登華麗 (Glamorous)"
]);
const FitZ = z.enum(["寬鬆","標準","合身"]);

// ===== Analyze & Recommend v1.1 (對應你對話提示的輸出) =====
export const AnalyzeAndRecommendV11Z = z.object({
  mode: z.literal("analyze_and_recommend"),
  schema_version: z.literal("1.1"),

  analysis: z.object({
    body_shape: z.enum(["倒三角","梨形","矩形","沙漏","不確定"]),
    proportion_notes: z.array(z.string()),
    color_tone: z.enum(["冷","暖","中性","不確定"]),
    style_keywords: z.array(StyleKeywordZ),
    occasions: z.array(OccasionZ),
    length_preference: z.object({
      top_length: z.array(z.enum(["短版","及腰","過臀"])),
      skirt_length: z.array(z.enum(["迷你","及膝","過膝","長裙"])),
      pant_length: z.array(z.enum(["短褲","九分","全長"]))
    }),
    fit_preference: z.array(FitZ),
    fit_avoid: z.array(z.enum(["太貼臀","太緊身","落肩過度","超短版","低腰"])),
    exposure_avoid: z.array(z.enum(["露胸","露背","露腰","透膚"]))
  }),

  outfit_suggestions: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      category: z.enum(["上衣","下身","鞋","外套","配件","洋裝"]),
      style: z.string(),
      fit: FitZ.optional(),
      color: z.string().optional(),
      optional: z.boolean().optional()
    })),
    reasons: z.array(z.string()),
    weather_tips: z.array(z.string()).optional()
  })),

  product_query: z.array(z.object({
    category: z.string(),
    style_tags: z.array(z.string()),
    fit: z.array(FitZ),
    color: z.array(z.string()),
    material: z.array(z.string()).optional(),
    price_range: z.enum(["低","中","高","不確定"]),
    occasion: z.array(OccasionZ)
  })),

  rerank_request: z.object({
    policy: z.object({
      priority: z.array(z.enum(["silhouette_fit","category_style","color","material_texture"])),
      notes: z.array(z.string())
    })
  }),

  // 可選：若你有提供候選且已精排
  reranked_products: z.array(z.object({
    sku: z.string(),
    score: z.number(),
    match_reasons: z.array(z.string()).optional(),
    conflicts: z.array(z.string()).optional()
  })).optional()
});

export type AnalyzeAndRecommendV11 = z.infer<typeof AnalyzeAndRecommendV11Z>;

// ===== Integration Result v2.0 (商品+專家RAG整合) =====
const SourceRefZ = z.object({
  title: z.string(),
  origin: z.string(),
  url: z.string().url().optional()
});

const WeatherContextZ = z.object({
  temperature: z.number().optional(),
  condition: z.string().optional(),
  humidity: z.number().optional(),
  wind_speed: z.number().optional(),
  uv_index: z.number().optional(),
  rain_probability: z.number().optional()
});

const UserProfileZ = z.object({
  style_whitelist: z.array(StyleKeywordZ).optional(),
  fit_preference: z.array(FitZ).optional(),
  fit_avoid: z.array(z.string()).optional(),
  exposure_avoid: z.array(z.string()).optional(),
  size_profile: z.object({
    top: z.string().optional(),
    bottom: z.string().optional(),
    height_cm: z.number().optional()
  }).optional(),
  color_palette: z.array(z.string()).optional()
});

const IntentSummaryZ = z.object({
  mode: z.enum(["analyze_and_recommend","trend_summary","travel_plan","rerank"]),
  text_query: z.string().optional(),
  has_image: z.boolean().optional(),
  needs_weather: z.boolean().optional(),
  needs_rag: z.boolean().optional(),
  destinations: z.array(z.string()).optional(),
  date_range: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  occasions: z.array(OccasionZ).optional()
});

const RagChunkZ = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  span: z.string(),
  score: z.number(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).optional()
});

const RagRuleZ = z.object({
  key: z.string(),
  description: z.string(),
  weight: z.number(),
  origin_chunk_id: z.string(),
  category: z.enum(["positive","negative","etiquette","size_fit"])
});

const ExpertRagZ = z.object({
  query_text: z.string(),
  retriever: z.object({
    embedding_model: z.string(),
    method: z.enum(["hybrid","vector","bm25"]),
    top_k: z.number()
  }),
  topk_chunks: z.array(RagChunkZ),
  normalized_guidance: z.object({
    positive_rules: z.array(RagRuleZ),
    negative_rules: z.array(RagRuleZ),
    etiquette: z.array(RagRuleZ).optional(),
    size_fit_hints: z.array(RagRuleZ).optional()
  }),
  provenance: z.array(SourceRefZ)
});

export const ProductQueryZ = z.object({
  category: z.string().optional(),
  style_tags: z.array(z.string()).optional(),
  fit: z.array(FitZ).optional(),
  color: z.array(z.string()).optional(),
  material: z.array(z.string()).optional(),
  price_range: z.enum(["低","中","高","不確定"]).optional(),
  occasion: z.array(OccasionZ).optional()
});

const CandidateZ = z.object({
  sku: z.string(),
  title: z.string(),
  image: z.string(),
  url: z.string().url().optional(),
  attrs: z.object({
    style: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    material: z.array(z.string()).optional(),
    silhouette: z.string().optional(),
    occasion: z.array(OccasionZ).optional(),
    price_band: z.enum(["低","中","高","不確定"]).optional(),
    clo: z.number().optional(),
    layer_type: z.enum(["base","mid","shell"]).optional()
  }).optional(),
  recall_from: z.enum(["clip","keyword","catalog_boost","fallback_popular"]),
  recall_score: z.number().optional()
});

const ProductRetrievalZ = z.object({
  product_query: z.array(ProductQueryZ),
  expansions: z.object({
    trends: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    items: z.array(z.string()).optional()
  }).optional(),
  recall_sets: z.object({
    clip: z.array(CandidateZ).optional(),
    keyword: z.array(CandidateZ).optional(),
    catalog_boost: z.array(CandidateZ).optional(),
    fallback_popular: z.array(CandidateZ).optional()
  }),
  merged_candidates_count: z.number(),
  index_info: z.object({
    version: z.string(),
    ts: z.string()
  }).optional()
});

const SubScoresZ = z.object({
  clip: z.number().optional(),
  attr: z.number().optional(),
  style: z.number().optional(),
  occasion: z.number().optional(),
  weather: z.number().optional(),
  kb: z.number().optional(),
  penalties: z.number().optional()
});

const RerankRowZ = z.object({
  sku: z.string(),
  final_score: z.number(),
  rank: z.number().int().min(1),
  subscores: SubScoresZ,
  hits: z.object({
    kb_rules: z.array(z.string()).optional(),
    weather_rules: z.array(z.string()).optional()
  }).optional(),
  conflicts: z.array(z.string()).optional(),
  reasons: z.array(z.string()).optional()
});

const RerankBlockZ = z.object({
  weights: z.object({
    clip: z.number(),
    attr: z.number(),
    style: z.number(),
    occasion: z.number(),
    weather: z.number(),
    kb: z.number(),
    penalties: z.number()
  }),
  algorithm: z.enum(["linear","l2r","llm-judge"]),
  rows: z.array(RerankRowZ),
  threshold: z.number().optional(),
  fallback_used: z.boolean().optional()
});

const OutputBlockZ = z.object({
  outfit_suggestions: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      category: z.string(),
      style: z.string(),
      fit: z.string().optional(),
      color: z.string().optional(),
      optional: z.boolean().optional()
    })),
    reasons: z.array(z.string()),
    weather_tips: z.array(z.string()).optional()
  })).optional(),
  product_suggestions: z.array(z.object({
    sku: z.string(),
    title: z.string(),
    image: z.string(),
    url: z.string().url().optional(),
    score: z.number(),
    rank: z.number().int(),
    match_reasons: z.array(z.string()).optional(),
    conflicts: z.array(z.string()).optional()
  })).optional(),
  product_query: z.array(ProductQueryZ),
  sources: z.array(SourceRefZ).optional()
});

const MetaZ = z.object({
  schema_version: z.literal("2.0"),
  request_id: z.string(),
  locale: z.string().optional(),
  currency: z.string().optional(),
  ab_test: z.string().optional()
});

const AuditZ = z.object({
  timings_ms: z.object({
    intent: z.number().optional(),
    weather: z.number().optional(),
    rag: z.number().optional(),
    retrieval: z.number().optional(),
    rerank: z.number().optional(),
    llm: z.number().optional(),
    total: z.number().optional()
  }).optional(),
  cache_hits: z.object({
    weather: z.boolean().optional(),
    trends: z.boolean().optional(),
    rag: z.boolean().optional(),
    clip: z.boolean().optional()
  }).optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional()
});

export const IntegrationResultZ = z.object({
  meta: MetaZ,
  intent: IntentSummaryZ,
  user_profile: UserProfileZ.optional(),
  weather_context: WeatherContextZ.optional(),
  expert_rag: ExpertRagZ.optional(),
  product_retrieval: ProductRetrievalZ,
  rerank: RerankBlockZ,
  output: OutputBlockZ,
  audit: AuditZ
});

export type IntegrationResult = z.infer<typeof IntegrationResultZ>;
export type ProductQuery = z.infer<typeof ProductQueryZ>;
export type Candidate = z.infer<typeof CandidateZ>;
export type RerankRow = z.infer<typeof RerankRowZ>;
export type ExpertRag = z.infer<typeof ExpertRagZ>;
export type WeatherContext = z.infer<typeof WeatherContextZ>;
export type UserProfile = z.infer<typeof UserProfileZ>;
export type IntentSummary = z.infer<typeof IntentSummaryZ>;