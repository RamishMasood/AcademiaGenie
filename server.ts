import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: '/tmp/' });

async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  apiRouter.post("/analyze-cv", upload.array("files"), async (req, res) => {
    try {
      const { customApiKey, selectedModel } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const files = req.files as Express.Multer.File[];
      let cvText = "";

      for (const file of files) {
        try {
          const data = fs.readFileSync(file.path);
          const parser = new PDFParse({ data });
          const pdfData = await parser.getText();
          cvText += pdfData.text + "\n";
        } finally {
          // cleanup uploaded file even if processing fails
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
      
      const prompt = `Act as an expert Academic Advisor Agent. You are performing a specialized SUBSTANCE ANALYSIS of a candidate's profile.
      
      CRITICAL INSTRUCTIONS:
      1. This text was extracted from a PDF and is presented to you as a raw string. 
      2. YOU MUST NOT comment on, mention, or critique the "layout", "formatting", "structure", "raw text", "flow", "clutter", or "visual organization". 
      3. Any mention of the document's appearance or "unformatted text flow" is a HALLUCINATION and is strictly forbidden.
      4. Imagine you are reading a typed transcript of an interview. Evaluate ONLY the accomplishments, research potential, and academic standing.
      
      Respond with ONLY a valid JSON object with this exact structure:
      {
        "profileStrengthScore": 8,
        "benchmark": "Benchmark based on competitive academic standards (e.g. Ivy League, Research Tier 1)",
        "strengths": ["specific achievement evidenced in the text"],
        "weaknesses": ["content-based gaps only, like missing publications or specific technical lack"],
        "actionableAdvice": ["specific academic career steps"]
      }

      CV Content:
      ${cvText}
      `;

      const response = await ai.models.generateContent({
        model: selectedModel || "gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "{}";

      res.json({ analysis: JSON.parse(text.replace(/^\s*```json\n?|\n?```\s*$/g, '') || "{}"), cvText: cvText });
    } catch (error: any) {
      console.error('CV Analysis Error:', error);
      const errorStr = JSON.stringify(error);
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes("429") || 
                          error?.message?.includes("quota") || 
                          error?.message?.includes("RESOURCE_EXHAUSTED") ||
                          errorStr.includes("429") ||
                          errorStr.includes("quota");

      const errorMessage = isRateLimit 
          ? "AI Quota/Rate limit exceeded. Model limit reached. Please try changing the AI Model in 'Settings' or provide your own Gemini API key to continue immediately." 
          : "Failed to analyze CV: " + (error.message || "Unknown error");
      res.status(isRateLimit ? 429 : 500).json({ error: errorMessage });
    }
  });

  apiRouter.post("/test-api-key", async (req, res) => {
    try {
      const { customApiKey, selectedModel } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "No API key provided" });
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const response = await ai.models.generateContent({
        model: selectedModel || "gemini-flash-latest",
        contents: "Say hello briefly."
      });
      res.json({ status: "success", message: response.text });
    } catch (error: any) {
      console.error('API Key Test Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/suggest-opportunities", async (req, res) => {
    try {
      const { cvText, country, customApiKey, selectedModel, excludedProfessors } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      let exclusionInstruction = "";
      if (excludedProfessors && Array.isArray(excludedProfessors) && excludedProfessors.length > 0) {
        exclusionInstruction = `\n7. EXCLUSION: DO NOT include any of the following professors in your new results as the user has already seen them: ${excludedProfessors.join(", ")}. find completely new matches.`;
      }

      const prompt = `Act as a Professional Academic Matching Agent. Based on the provided CV, identify relevant research opportunities and a SUBSTANTIAL list of potential academic advisors (professors) who would be a strong match for this candidate.
      
      CRITICAL INSTRUCTIONS:
      1. LOCALE: All suggested opportunities and professors MUST BE LOCATED IN: ${country || 'Any Country'}. If a specific country is provided, do NOT suggest anybody outside it.
      2. VOLUME: Attempt to find at least 40-60 professors if possible (provide as many as the model limits allow, ideally a very comprehensive list).
      3. UNIVERSITY TYPE: For each professor, identify if their university is 'Government', 'Semi-Government', or 'Private'.
      4. MATCH SCORE: For each professor, provide a 'matchScore' (0-100) based on research interest overlap with the candidate.
      5. PRECISION: Ensure the research areas are specific and personalized to the candidate's strengths.
      6. EMAILS: Include publicly known academic email formats or exact emails if known.${exclusionInstruction}

      IMPORTANT: Respond ONLY with a valid JSON file with this exact structure:
      {
        "opportunities": [
          { "title": "String", "description": "String" }
        ],
        "professors": [
          { 
            "name": "String", 
            "university": "String", 
            "universityType": "Government | Semi-Government | Private",
            "researchArea": "String (specific to overlap)", 
            "matchScore": Number (0-100),
            "email": "String or null" 
          }
        ]
      }
      CV Content: ${cvText}
      `;
      const response = await ai.models.generateContent({
        model: selectedModel || "gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "{}";
      res.json({ suggestions: JSON.parse(text.replace(/^\s*```json\n?|\n?```\s*$/g, '') || "{}") });
    } catch (error: any) {
      console.error(error);
      const errorStr = JSON.stringify(error);
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes("429") || 
                          error?.message?.includes("quota") || 
                          error?.message?.includes("RESOURCE_EXHAUSTED") ||
                          errorStr.includes("429") ||
                          errorStr.includes("quota");

      const errorMessage = isRateLimit 
          ? "AI Quota/Rate limit exceeded. Try changing the AI Model in 'Settings' or provide your own Gemini API key." 
          : "Failed to suggest opportunities";
      res.status(isRateLimit ? 429 : 500).json({ error: errorMessage });
    }
  });

  apiRouter.post("/generate-email", async (req, res) => {
    try {
      const { cvText, professor, customApiKey, selectedModel } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `Act as a Professional Academic Outreach Expert. Write a highly personalized, structured cold email to a professor for a research opportunity.
      
      STRICT FORMATTING AND CONTENT GUIDELINES (FOLLOW EXACTLY):
      
      1. SUBJECT LINE: Format as "Subject: Graduate Candidate | CGPA [Value], IELTS [Value], [Top Certification], [Degree/Title]".
         Extract these specific values from the CV. If values are missing, use representative placeholders or generic terms from the CV.
      
      2. SALUTATION: "Dear Professor [Last Name],"
      
      3. OPENING: Starts with "I hope this email finds you well."
      
      4. PARAGRAPH 1 (Research Fit & Inspiration): Explicitly reference the professor's research in "${professor.researchArea}". IF POSSIBLE, mention a specific notable research paper, project, or breakthrough associated with Professor ${professor.name} that inspired you (use your internal knowledge of this academic). Showcase how this specific work or methodology aligns with your professional background and research interests. If specific titles are unavailable, ensure the connection to the research area feels deeply personalized rather than generic. Mention applying for Master's/PhD programs for 2026.
      
      5. PARAGRAPH 2 (Technical Stack): List specific technologies used (e.g., React, Next.js, Python, TypeScript, etc.) based on the user's CV.
      
      6. SECTION 3 (Bulleted Highlights): Include a section titled "Here are a few highlights from my background:" followed by bullet points detailing:
         - Significant projects (e.g., MindPrism AI, LegalInsight AI)
         - Academic achievements (GPA, scholarships)
         - Notable certifications (e.g., CS50, Google, EITCI)
         - Test scores (IELTS/GRE if available)
         - Major technical accomplishments
      
      7. CLOSING: Request a short Zoom call and mention the CV is attached.
      
      8. SIGNATURE:
         Best Regards,
         [Full Name]
         [Email]
         Phone: [Phone Number]
         Portfolio: [Behance/GitHub/Personal Website Links]
         LinkedIn: [LinkedIn URL]

      Visual Style: Use double line breaks between paragraphs. Use a clean, modern academic tone.
      
      Professor Details:
      Name: ${professor.name}
      University: ${professor.university}
      Research Area: ${professor.researchArea}
      
      User's CV Content: ${cvText}
      
      Output ONLY the final email content. Do not include any other text or wrappers.
      `;
      const response = await ai.models.generateContent({
        model: selectedModel || "gemini-flash-latest",
        contents: prompt
      });
      res.json({ email: response.text });
    } catch (error: any) {
      console.error(error);
      const errorStr = JSON.stringify(error);
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes("429") || 
                          error?.message?.includes("quota") || 
                          error?.message?.includes("RESOURCE_EXHAUSTED") ||
                          errorStr.includes("429") ||
                          errorStr.includes("quota");

      const errorMessage = isRateLimit 
          ? "AI Quota/Rate limit exceeded. Try changing the AI Model in 'Settings' or provide your own Gemini API key." 
          : "Failed to generate email";
      res.status(isRateLimit ? 429 : 500).json({ error: errorMessage });
    }
  });

  apiRouter.post("/generate-roadmap", async (req, res) => {
    try {
      const { cvText, customApiKey, selectedModel } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `Act as a Roadmap Planning Agent. Based on the following CV, create a structured improvement roadmap to help the candidate secure top-tier academic or research opportunities.
      IMPORTANT: Respond ONLY with a valid JSON format without any markdown wrappers (\`\`\`json). The JSON must match this structure exactly:
      {
        "overview": "Summary of the strategy",
        "phases": [
          {
            "title": "Phase name",
            "duration": "e.g., Months 1-3",
            "goals": ["Actionable goal 1", "Actionable goal 2"],
            "resources": ["Resource or certification 1", "Resource 2"]
          }
        ]
      }
      CV Content: ${cvText}
      `;
      const response = await ai.models.generateContent({
        model: selectedModel || "gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "{}";
      const cleanedJSON = text.replace(/^\s*```json\n?|\n?```\s*$/g, '');
      res.json({ roadmap: JSON.parse(cleanedJSON) });
    } catch (error: any) {
      console.error(error);
      const errorStr = JSON.stringify(error);
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes("429") || 
                          error?.message?.includes("quota") || 
                          error?.message?.includes("RESOURCE_EXHAUSTED") ||
                          errorStr.includes("429") ||
                          errorStr.includes("quota");

      const errorMessage = isRateLimit 
          ? "AI Quota/Rate limit exceeded. Try changing the AI Model in 'Settings' or provide your own Gemini API key." 
          : "Failed to generate roadmap";
      res.status(isRateLimit ? 429 : 500).json({ error: errorMessage });
    }
  });

  // API Route 404 Handler - MUST be before general error handler
  apiRouter.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} /api${req.url}` });
  });

  // Handle all API errors by returning JSON instead of Vite HTML stack traces
  apiRouter.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  // Mount the customized router
  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

const appPromise = createServer();

// For internal dev server
if (process.env.NODE_ENV !== "production") {
  appPromise.then(app => {
    app.listen(3000, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:3000`);
    });
  });
}

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
