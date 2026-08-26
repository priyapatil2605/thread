const Product = require('../models/Product');

/**
 * TRY-ON ENDPOINT
 *
 * Two providers, chosen automatically:
 *
 *  1. FREE (default) — Google Gemini 2.5 Flash Image ("nano-banana").
 *     Genuinely free within daily limits, no credit card. Not a
 *     specialized try-on model, so it works from a text+image prompt
 *     rather than pixel-perfect garment masking — but it handles all
 *     categories (tops, bottoms, dresses), unlike the old HF path.
 *
 *  2. PAID (optional upgrade) — Replicate's hosted IDM-VTON. Used
 *     automatically instead of Gemini if you set REPLICATE_API_TOKEN in
 *     backend/.env. Costs a few cents per run but gives sharper,
 *     purpose-built garment-fitting results.
 */

const REPLICATE_MODEL = 'cuuupid/idm-vton';
const GEMINI_MODEL = 'gemini-2.5-flash-image-preview';
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 45; // ~90s ceiling for the Replicate path

function categoryToGarmentType(category) {
  if (category === 'bottom') return 'lower_body';
  if (category === 'dress') return 'dresses';
  return 'upper_body';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function toInlineImage(source) {
  if (source.startsWith('data:')) {
    const [header, b64] = source.split(',');
    const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
    return { mimeType, base64: b64 };
  }
  const res = await fetch(source);
  if (!res.ok) throw new Error(`Could not download image (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  const mimeType = res.headers.get('content-type') || 'image/jpeg';
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { mimeType, base64 };
}

async function runViaGemini({ garmImg, humanImg, description, category }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set in backend/.env — get a free key at aistudio.google.com/apikey'
    );
  }

  const [garment, human] = await Promise.all([toInlineImage(garmImg), toInlineImage(humanImg)]);

  const prompt =
    `You are editing the second image (a photo of a person) to show them wearing the garment ` +
    `from the first image (${description || 'a garment'}, category: ${category}). ` +
    `Keep the person's face, body, pose, and background exactly the same. Replace only the ` +
    `relevant clothing area with the new garment, fitted naturally and realistically with correct ` +
    `draping, shadows, and proportions. Output only the final edited photo.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: garment.mimeType, data: garment.base64 } },
          { inline_data: { mime_type: human.mimeType, data: human.base64 } },
        ],
      },
    ],
    generationConfig: { responseModalities: ['IMAGE'] },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini rejected the request (${res.status})`);
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inline_data || p.inlineData);
  const inline = imagePart?.inline_data || imagePart?.inlineData;

  if (!inline?.data) {
    throw new Error('Gemini did not return an image — it may have refused this request, try again');
  }

  const mime = inline.mime_type || inline.mimeType || 'image/png';
  return `data:${mime};base64,${inline.data}`;
}

async function runViaReplicate({ garmImg, humanImg, category, description }) {
  const modelRes = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}`, {
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
  });
  const modelData = await modelRes.json();
  if (!modelRes.ok) {
    throw new Error(modelData?.detail || `Could not look up the try-on model (${modelRes.status})`);
  }
  const version = modelData?.latest_version?.id;
  if (!version) throw new Error('Try-on model has no available version right now');

  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version,
      input: {
        garm_img: garmImg,
        human_img: humanImg,
        garment_des: description || 'a garment',
        category,
        crop: false,
        force_dc: false,
        mask_only: false,
        steps: 30,
        seed: Math.floor(Math.random() * 1000000),
      },
    }),
  });
  const prediction = await createRes.json();
  if (!createRes.ok) {
    throw new Error(prediction?.detail || `Replicate rejected the request (${createRes.status})`);
  }

  for (let i = 0; i < MAX_POLLS; i++) {
    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
    });
    const data = await pollRes.json();
    if (data.status === 'succeeded') {
      return Array.isArray(data.output) ? data.output[0] : data.output;
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(data.error || 'Try-on generation failed on the model side');
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error('Try-on took too long and timed out — try again in a moment');
}

exports.generateTryOn = async (req, res) => {
  try {
    const { productId, userPhotoUrl } = req.body;

    if (!productId) return res.status(400).json({ message: 'productId is required' });
    if (!userPhotoUrl) return res.status(400).json({ message: 'A photo of you is required for try-on' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const garmImg = product.images?.[0];
    if (!garmImg) return res.status(422).json({ message: 'This product has no image to try on yet' });
    if (product.category === 'footwear' || product.category === 'accessory') {
      return res.status(422).json({ message: 'Virtual try-on currently supports tops, bottoms, and dresses only' });
    }

    const usingReplicate = Boolean(process.env.REPLICATE_API_TOKEN);

    const resultImageUrl = usingReplicate
      ? await runViaReplicate({
          garmImg,
          humanImg: userPhotoUrl,
          category: categoryToGarmentType(product.category),
          description: product.name,
        })
      : await runViaGemini({
          garmImg,
          humanImg: userPhotoUrl,
          category: categoryToGarmentType(product.category),
          description: product.name,
        });

    res.json({ status: 'succeeded', productId, resultImageUrl, provider: usingReplicate ? 'replicate' : 'gemini' });
  } catch (err) {
    res.status(500).json({ message: 'Try-on generation failed', error: err.message });
  }
};