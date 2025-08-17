// backend/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSearchOrchestrator } from "./services/search/orchestrator";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new WebSearchOrchestrator();

// GET /search?q=...
app.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "");
    if (!q.trim()) return res.status(400).json({ error: "missing_query" });
    
    console.log(`🔍 WebSearch request: "${q}"`);
    const pack = await orchestrator.run(q);
    return res.json(pack);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ 
      error: "search_failed", 
      detail: String(err?.message || err) 
    });
  }
});

// POST /search { q: "..." }
app.post("/search", async (req, res) => {
  try {
    const q = String(req.body?.q || "");
    if (!q.trim()) return res.status(400).json({ error: "missing_query" });
    
    console.log(`🔍 WebSearch POST request: "${q}"`);
    const pack = await orchestrator.run(q);
    return res.json(pack);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ 
      error: "search_failed", 
      detail: String(err?.message || err) 
    });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const health = await orchestrator.healthCheck();
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      search: health
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

// 靜態示範頁
app.use("/", express.static("frontend/public"));

const port = process.env.PORT ? Number(process.env.PORT) : 3005;
app.listen(port, () => console.log(`✅ WebSearch API running on http://localhost:${port}`));

export default app;