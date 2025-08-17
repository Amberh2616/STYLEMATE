import { writeFileSync } from "node:fs";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// 1) 匯入你的 Zod schema（把路徑換成你專案的）
import { IntegrationResultZ } from "../backend/llm/validators/zodSchemas"; 
// 如果你也要單列 analyze_and_recommend v1.1，可再匯入對應 Zod

// 2) 轉換（指定 target: "jsonSchema2020-12"）
const jsonSchema = zodToJsonSchema(IntegrationResultZ, {
  target: "jsonSchema2020-12",
  name: "IntegrationResult"
});

// 3) 輸出
writeFileSync(
  "schemas/integration_result.schema.json",
  JSON.stringify(jsonSchema, null, 2),
  "utf-8"
);

console.log("✅ Wrote schemas/integration_result.schema.json");