// scripts/gen-v11-schema.ts
import { writeFileSync } from "node:fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { AnalyzeAndRecommendV11Z } from "../backend/llm/validators/zodSchemas";

const jsonSchema = zodToJsonSchema(AnalyzeAndRecommendV11Z, {
  target: "jsonSchema2020-12",
  name: "AnalyzeAndRecommendV1_1"
});

writeFileSync(
  "schemas/analyze_and_recommend_v1_1.schema.json",
  JSON.stringify(jsonSchema, null, 2),
  "utf-8"
);
console.log("✅ wrote schemas/analyze_and_recommend_v1_1.schema.json");