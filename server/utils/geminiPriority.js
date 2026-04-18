const { GoogleGenerativeAI } = require("@google/generative-ai");

const PRIORITY_LEVELS = ["Low", "Medium", "High", "Critical"];
const MODEL_NAME = "gemini-2.5-flash";

const cachedModels = new Map();

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value || "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

function normalizePriority(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) return null;

  if (/\bcritical\b/.test(raw)) return "Critical";
  if (/\bhigh\b/.test(raw)) return "High";
  if (/\bmedium\b/.test(raw)) return "Medium";
  if (/\blow\b/.test(raw)) return "Low";

  return null;
}

const DEFAULT_PRIORITY =
  normalizePriority(process.env.GEMINI_DEFAULT_PRIORITY) || "Medium";
const MAX_INPUT_LENGTH = toPositiveInteger(
  process.env.GEMINI_MAX_INPUT_LENGTH,
  3000,
);

const sanitizeComplaintText = (text) => {
  return String(text || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
};

const getGeminiModel = () => {
  if (cachedModels.has(MODEL_NAME)) {
    return cachedModels.get(MODEL_NAME);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured. Using default priority.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  cachedModels.set(MODEL_NAME, model);
  return model;
};

const predictComplaintPriority = async (complaintText) => {
  const sanitizedText = sanitizeComplaintText(complaintText);
  if (!sanitizedText) {
    return DEFAULT_PRIORITY;
  }

  const prompt = [
    "You classify hostel complaints by urgency.",
    "Return exactly one value from: Low, Medium, High, Critical.",
    "Do not add punctuation or explanation.",
    `Complaint: \"\"\"${sanitizedText}\"\"\"`,
  ].join("\n");

  const model = getGeminiModel();
  if (!model) {
    return DEFAULT_PRIORITY;
  }

  try {
    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.() || "";
    const priority = normalizePriority(responseText);

    if (priority && PRIORITY_LEVELS.includes(priority)) {
      return priority;
    }

    console.error("Gemini returned an invalid priority:", responseText);
    return DEFAULT_PRIORITY;
  } catch (error) {
    console.error(
      `Gemini priority prediction failed with ${MODEL_NAME}:`,
      error?.message || String(error),
    );
    return DEFAULT_PRIORITY;
  }
};

module.exports = {
  PRIORITY_LEVELS,
  DEFAULT_PRIORITY,
  sanitizeComplaintText,
  predictComplaintPriority,
};
