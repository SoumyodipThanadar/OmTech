require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    console.log("REQ RECEIVED:", req.body);

    const { message, history } = req.body;

    const cleanHistory = (history || []).filter(
      msg => msg.text && msg.text.trim() !== "" && msg.text !== "..."
    );

    const alternatingHistory = [];
    let lastRole = null;

    for (const msg of cleanHistory) {
      const role = msg.from === "user" ? "user" : "model";
      if (role === lastRole) continue;
      alternatingHistory.push({
        role,
        parts: [{ text: msg.text }]
      });
      lastRole = role;
    }

    while (
      alternatingHistory.length > 0 &&
      alternatingHistory[alternatingHistory.length - 1].role === "user"
    ) {
      alternatingHistory.pop();
    }

    while (
      alternatingHistory.length > 0 &&
      alternatingHistory[0].role === "model"
    ) {
      alternatingHistory.shift();
    }

    const contents = [
      ...alternatingHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are JeevanDhara, a smart healthcare and safety assistant for India.

Rules:
- If user asks about ambulance, guide them to call 108
- If hospital, ask location and suggest nearby hospitals
- If emergency/danger, tell them to call 112 immediately
- Answer general health questions clearly
- Be friendly, short, and helpful
- If unrelated question, still answer politely`
            }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini HTTP error:", response.status, errText);
      return res.status(500).json({ reply: "Sorry, I couldn't get a response. Please try again." });
    }

    const data = await response.json();
    console.log("GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API error:", data.error);
      return res.status(500).json({ reply: "Sorry, I couldn't get a response. Please try again." });
    }

    if (!data.candidates || !data.candidates[0]) {
      console.error("No candidates in Gemini response:", JSON.stringify(data, null, 2));
      return res.status(500).json({ reply: "Sorry, I couldn't get a response. Please try again." });
    }

    const candidate = data.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.warn("Gemini finish reason:", candidate.finishReason);
      return res.status(500).json({ reply: "Sorry, the response was blocked. Please rephrase your message." });
    }

    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      console.error("Missing content parts:", JSON.stringify(candidate, null, 2));
      return res.status(500).json({ reply: "Sorry, I couldn't get a response. Please try again." });
    }

    const reply = candidate.content.parts[0].text;
    res.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error.message);
    res.status(500).json({ reply: "Server error: " + error.message });
  }
});

// ✅ Changed from 3001 to 8081
app.listen(8081, () => console.log("✅ Server running on http://localhost:8081"));