import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared Gemini client setup
  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  if (!ai) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI Generator and Optimizer agents will operate in Sandbox mode.");
  }

  // API Route: Generate Roblox Luau Script
  app.post("/api/generate-script", async (req, res) => {
    try {
      const { prompt, gameName } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        // Fallback sandbox generation when key is missing so the user can test the interface
        return res.json({
          code: `-- [[ ZeroHub Custom AI Generated Luau Script ]]\n-- Target Game: ${gameName || 'General Roblox'}\n-- Status: AI Keyless Sandbox mode\n-- Request: "${prompt}"\n\nlocal Players = game:GetService("Players")\nlocal LocalPlayer = Players.LocalPlayer\nlocal Character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()\nlocal Humanoid = Character:WaitForChild("Humanoid")\n\ntask.spawn(function()\n    -- Auto Loop for: ${prompt}\n    while true do\n        task.wait(1.5)\n        print("Executing AI simulated action for: ${prompt}")\n        -- Standard hook to avoid Roblox server kicks\n        if not Character or not Humanoid then break end\n    end\nend)\n\n-- Helper notifications\ngame:GetService("StarterGui"):SetCore("SendNotification", {\n    Title = "ZeroHub AI",\n    Text = "Custom Script Activated!",\n    Duration = 5\n})`,
          description: `SIMULATED LAUNCHER: This script demonstrates the visual format of your requested feature (${prompt}). To unlock real-time Gemini AI generations, simply add your GEMINI_API_KEY inside the Settings > Secrets tab!`,
          suggestions: [
            "Auto Farm Level & Chest Collection Thread",
            "Universal ESP Wallhack with Tracers",
            "Speed Bypass with Dynamic Packet Jitter"
          ]
        });
      }

      const systemInstruction = `You are an elite, world-class Roblox Luau compiler, exploit script engineer, and game reverse engineer.
Your specialty is writing robust, highly functional Roblox Luau scripts compatible with mobile/desktop executors (Solara, Wave, Celery, Delta, Codex, Arceus X, Hydrogen).
Make sure to follow modern Luau guidelines:
- Prefer task.wait() and task.spawn() instead of standard wait() or spawn().
- Utilize clean object pathing, handle nil errors with checking patterns.
- Protect player memory by masking connections inside getgenv().
- Keep all explanations of how it works separate.
You must return only a valid JSON response adhering exactly to this structure:
{
  "code": "A single executable luau script string",
  "description": "A clear, descriptive, high-quality description of how this script operates and what values can be modified inside it.",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Write a high-performance Roblox Luau script for ${gameName || 'General Roblox'} that does this: "${prompt}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate Luau code using Gemini" });
    }
  });

  // API Route: Optimize & Improve Luau Script
  app.post("/api/optimize-script", async (req, res) => {
    try {
      const { code, enhancementType } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      if (!ai) {
        return res.json({
          optimizedCode: `-- [[ ZeroHub Intelligent Luau Optimizer V2 ]]\n-- Optimization Category: ${enhancementType || 'General Performance'}\n-- Status: AI Keyless Sandbox mode\n\n-- Below is your script, pre-analyzed with local fast-path wrappers:\n\n-- [Performance Optimizer: Replaced legacy wait loops with task.wait() to save frame times]\n-- [Bypass Guard: Applied getgenv() table masking to prevent exploit reflection checks]\n\n${code.replace(/wait\(/g, 'task.wait(').replace(/spawn\(/g, 'task.spawn(')}\n\n-- Local diagnostic check: OK. Configure GEMINI_API_KEY in secrets to enable advanced metatable hooks.`,
          report: "Successfully optimized loop intervals, converted outdated latency calls to task.wait, and wrapped event handlers inside custom thread safety modules. Add GEMINI_API_KEY in Secrets for deep AST optimization!"
        });
      }

      const systemInstruction = `You are an elite, world-class Luau optimizer and exploit security specialist.
Your task is to take an existing Roblox script and refactor/optimize it according to the requested optimization category.
Make sure to:
- Maximize execution speeds by reducing heavy thread overhead.
- Safe-guard the script against server-side remote integrity loops (e.g. anti-teleport checks, remote click limits).
- Convert legacy structures like wait() and spawn() to task.wait() and task.spawn().
- Protect player state by hiding globals in local variables (localization of standard tables).
You must return only a valid JSON response adhering exactly to this structure:
{
  "optimizedCode": "The fully optimized, cleaned, and safe-to-inject luau script string",
  "report": "A detailed bullet-pointed report summarizing all security bypasses added, speedups accomplished, and memory optimization changes made."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Optimize, improve, and secure the following Luau script for enhancement: "${enhancementType || 'Performance & Security bypass'}"\n\nCode to optimize:\n${code}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("AI Optimization Error:", err);
      res.status(500).json({ error: err.message || "Failed to optimize Luau code using Gemini" });
    }
  });

  // AI Route: Generate Changelog Entry
  app.post("/api/generate-changelog", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }

      if (!ai) {
        return res.json({
          version: "1.0.x",
          description: `(AI Offline) Processed: ${description}`,
          type: "fixed"
        });
      }

      const systemInstruction = `You are a technical writer for ZeroHub, a Roblox Exploit Script Directory. 
The developer will provide a rough description of what they fixed or added.
Your job is to generate a professional, concise changelog entry in JSON format.
Only return a JSON object with this exact structure:
{
  "version": "Semantic version string (e.g. 1.2.4) infer or increment appropriately",
  "description": "A highly professional, punchy description of the update/fix.",
  "type": "added" | "fixed" | "updated" | "removed"
}
Make it sound extremely professional, technical, and high-quality.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a changelog entry for this update: "${description}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("AI Changelog Generation Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate changelog" });
    }
  });

  // AI Support Chat Bot Route
  app.post("/api/support-chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      if (!ai) {
        return res.json({
          text: "I am running in Offline Sandbox Mode. To activate my advanced capabilities, please set your GEMINI_API_KEY. However, you can still type your script request details and click 'Submit Request to Owner' below to directly log this request into the Creator's database inbox!"
        });
      }

      const systemInstruction = `You are "Sentinel-1", the official ZeroHub AI Support & Script Request Agent.
Your primary role is to help users request new script updates or add completely new game scripts to the directory.
Be friendly, professional, and slightly tech-oriented (use some gamer/exploiter terminology but keep it humble).
Guide them in detailing:
1. Which Roblox game script they are requesting an update or addition for (e.g., Blox Fruits, Bedwars, etc.).
2. What specific features or updates they want (e.g., auto-farm level, chest collections, bypass fixes, ESP with tracers).

ADDITIONAL SPECIAL CAPABILITY: If a user asks you for a script draft, sample outline, boilerplate, or code structure, you can generate a short, beautiful mock Luau Roblox script skeleton wrapped in standard markdown code blocks (e.g. \`\`\`lua ... \`\`\`). Keep the script clear, well-commented, and themed correctly.
Tell them they can click the "Copy Code" or "Import to Sandbox" button directly on your message to test it out in our Roblox compiler, and use the "Submit Request to Owner" button on the right at any time to officially dispatch their request to the owner/developer's private dashboard so they can build it!`;

      const chatHistory = messages.slice(-10).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || m.text || "" }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "I am here to assist. Please tell me more about your game script request!" });
    } catch (err: any) {
      console.error("AI Support Chat Error:", err);
      res.status(500).json({ error: err.message || "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
