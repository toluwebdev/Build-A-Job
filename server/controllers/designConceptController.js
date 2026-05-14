import mongoose from "mongoose";
import OpenAI from "openai";
import DesignConcept from "../schema/designConceptSchema.js";

const ANALYSIS_MODEL = process.env.OPENAI_DESIGN_MODEL || "gpt-4o-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    return null;
  }
  return new OpenAI({ apiKey: key.trim() });
}

function normalizeDataImageUrl(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return null;
  }
  const trimmed = imageBase64.trim();
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
}

const ANALYSIS_SYSTEM_PROMPT = `You are an expert UK residential design and landscaping assistant.
Analyse the user's site photo and return practical design guidance for a homeowner planning improvements.
Respond with a single JSON object only (no markdown), using this shape:
{
  "summary": string (2-4 sentences),
  "spaceType": string (best guess, e.g. driveway, patio, garden, interior room),
  "materialsDetected": string[],
  "suggestedStyles": { "name": string, "rationale": string }[],
  "constraintsOrRisks": string[],
  "nextStepsForHomeowner": string[],
  "imagePromptHint": string (one dense paragraph: visible layout, surfaces, boundaries, lighting, colours — for an image model; no brand names; UK residential)
}
Be specific to what you can see; if unsure, say so briefly in the relevant field.`;

function buildDallePrompt(analysis, styleName, materialHint) {
  const hint =
    typeof analysis.imagePromptHint === "string"
      ? analysis.imagePromptHint
      : typeof analysis.summary === "string"
        ? analysis.summary
        : "";
  const space = typeof analysis.spaceType === "string" ? analysis.spaceType : "outdoor space";
  const parts = [
    "Photorealistic wide photograph of a UK residential property exterior or garden, same type of scene as a typical homeowner site survey.",
    `Primary space: ${space}.`,
    `Conceptual redesign direction (illustrative only, not a pixel-match to any reference photo): ${styleName}.`,
    materialHint ? `Materials and finish: ${materialHint}.` : "",
    `Scene and composition to depict: ${hint.slice(0, 1400)}`,
    "Natural daylight, plausible UK suburban context, no people, no faces, no readable text, no watermark, no logos, no number plates.",
  ].filter(Boolean);
  let prompt = parts.join(" ");
  if (prompt.length > 3950) {
    prompt = `${prompt.slice(0, 3920)}…`;
  }
  return prompt;
}

async function generateConceptImages(openai, analysis, stylesFromClient) {
  const concepts = [];
  let list = Array.isArray(stylesFromClient) ? stylesFromClient.slice(0, 4) : [];

  if (list.length === 0 && Array.isArray(analysis.suggestedStyles)) {
    list = analysis.suggestedStyles.slice(0, 4).map((s) => ({
      name: typeof s?.name === "string" ? s.name : "Design option",
      material: typeof s?.rationale === "string" ? s.rationale.slice(0, 200) : "",
    }));
  }

  if (list.length === 0) {
    list = [{ name: "Refreshed UK outdoor space", material: "" }];
  }

  for (const s of list) {
    const name = typeof s.name === "string" ? s.name : "Design option";
    const material =
      typeof s.material === "string"
        ? s.material
        : typeof s.materialHint === "string"
          ? s.materialHint
          : "";
    try {
      const prompt = buildDallePrompt(analysis, name, material);
      const img = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
        response_format: "url",
      });
      const url = img.data?.[0]?.url ?? null;
      concepts.push({
        styleName: name,
        materialHint: material,
        afterImageUrl: url,
      });
    } catch (e) {
      console.error("generateConceptImages:", name, e.message);
      concepts.push({
        styleName: name,
        materialHint: material,
        afterImageUrl: null,
        error: e.message,
      });
    }
  }

  return concepts;
}

/**
 * POST /api/design-concepts/analyze
 * Body: {
 *   imageBase64: string,
 *   context?: string,
 *   includeAfterImages?: boolean (default true),
 *   conceptStyles?: { name: string, material?: string }[]  // up to 4, e.g. carousel options
 * }
 */
export const analyzeDesignConcept = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return res.status(503).json({
        success: false,
        message:
          "AI analysis is not configured. Set OPENAI_API_KEY in the server environment.",
      });
    }

    const {
      imageBase64,
      context,
      includeAfterImages = true,
      conceptStyles,
    } = req.body || {};

    const imageUrl = normalizeDataImageUrl(imageBase64);
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageBase64 is required (JPEG/PNG as raw base64 or data URL).",
      });
    }

    const userText = context
      ? `${ANALYSIS_SYSTEM_PROMPT}\n\nExtra context from the homeowner:\n${String(context).slice(0, 4000)}`
      : ANALYSIS_SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 1600,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(502).json({
        success: false,
        message: "No analysis returned from the model.",
      });
    }

    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      analysis = { summary: raw, parseError: true };
    }

    const payload = {
      success: true,
      message: "Design analysis complete",
      model: ANALYSIS_MODEL,
      analysis,
      concepts: [],
      disclaimer:
        "AI-generated concepts are illustrative only and are not exact transformations of your photograph.",
    };

    if (includeAfterImages !== false && !analysis.parseError) {
      payload.concepts = await generateConceptImages(openai, analysis, conceptStyles);
      payload.imageModel = IMAGE_MODEL;
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error("analyzeDesignConcept:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to run design analysis",
      error: error.message,
    });
  }
};

/**
 * POST /api/design-concepts
 * Body: { beforeImage, afterImage?, label?, description?, analysis?, jobId? }
 */
export const createDesignConcept = async (req, res) => {
  try {
    const customerId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(401).json({ success: false, message: "Invalid user in token." });
    }

    const { beforeImage, afterImage, label, description, analysis, jobId } =
      req.body || {};

    if (!beforeImage || typeof beforeImage !== "string") {
      return res.status(400).json({
        success: false,
        message: "beforeImage is required (URL or stored path string).",
      });
    }

    const payload = {
      customerId: new mongoose.Types.ObjectId(customerId),
      beforeImage: beforeImage.trim(),
      afterImage: typeof afterImage === "string" ? afterImage.trim() : "",
      label: label ? String(label).slice(0, 200) : undefined,
      description: description ? String(description).slice(0, 5000) : undefined,
      analysis: analysis ? String(analysis).slice(0, 32000) : undefined,
    };

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: "Invalid jobId." });
      }
      payload.jobId = new mongoose.Types.ObjectId(jobId);
    }

    const doc = await DesignConcept.create(payload);
    return res.status(201).json({
      success: true,
      message: "Design concept saved",
      designConcept: doc,
    });
  } catch (error) {
    console.error("createDesignConcept:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save design concept",
      error: error.message,
    });
  }
};

/**
 * GET /api/design-concepts/:id
 */
export const getDesignConceptById = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }

    const doc = await DesignConcept.findOne({
      _id: id,
      customerId: new mongoose.Types.ObjectId(customerId),
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Design concept not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Design concept fetched",
      designConcept: doc,
    });
  } catch (error) {
    console.error("getDesignConceptById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch design concept",
      error: error.message,
    });
  }
};
