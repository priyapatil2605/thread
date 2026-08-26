const Product = require('../models/Product');
const { Client } = require('@gradio/client');

/**
 * TRY-ON ENDPOINT
 *
 * Two providers, chosen automatically:
 *
 *  1. FREE (default) — calls the public Hugging Face Space for IDM-VTON
 *     (huggingface.co/spaces/yisol/IDM-VTON). No API key, no cost. It's a
 *     shared community demo though, not a paid API: expect queues, slower
 *     runs at busy times, and (rarely) the Space being briefly offline.
 *
 *  2. PAID (optional upgrade) — Replicate's hosted version of the same
 *     model. Used automatically instead of the free path if you set
 *     REPLICATE_API_TOKEN in backend/.env. Costs a few cents per run but
 *     is far more consistent (dedicated infra, no queue).
 *
 * IDM-VTON itself is licensed CC BY-NC-SA — non-commercial use only, on
 * either provider. Fine for a personal project/prototype.
 */

const HF_SPACE = 'yisol/IDM-VTON';
const REPLICATE_MODEL = 'cuuupid/idm-vton';
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

// Turns a data URI or a hosted https URL into a Blob, which is what both
// the Gradio client and a raw fetch-based upload need.
async function toBlob(source) {
  if (source.startsWith('data:')) {
    const [header, b64] = source.split(',');
    const mime = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
    return new Blob([Buffer.from(b64, 'base64')], { type: mime });
  }
  const res = await fetch(source);
  if (!res.ok) throw new Error(`Could not download image (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  return new Blob([arrayBuffer], { type: res.headers.get('content-type') || 'image/jpeg' });
}

// ---------- FREE: Hugging Face Space ----------
async function runViaHuggingFace({ garmImg, humanImg, description }) {
  const client = await Client.connect(HF_SPACE, {
    hf_token: process.env.HF_TOKEN || undefined, // optional — raises rate limits if set
  });

  const [garmBlob, humanBlob] = await Promise.all([toBlob(garmImg), toBlob(humanImg)]);

  const result = await client.predict('/tryon', {
    dict: { background: humanBlob, layers: [], composite: null },
    garm_img: garmBlob,
    garment_des: description || 'a garment',
    is_checked: true,
    is_checked_crop: false,
    denoise_steps: 30,
    seed: Math.floor(Math.random() * 1000000),
  });

  const output = result?.data?.[0];
  const resultImageUrl =
    typeof output === 'string' ? output : output?.url || output?.path || null;

  if (!resultImageUrl) {
    throw new Error(
      'The free try-on service returned an unexpected response — it may have changed its interface. Try again in a moment, or switch to the paid Replicate provider (see backend/.env).'
    );
  }
  return resultImageUrl;
}

// ---------- PAID: Replicate ----------
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

// POST /api/tryon  { productId, userPhotoUrl }
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

    // The free Hugging Face demo hardcodes upper-body masking in its own
    // source — it has no category input at all, so it always masks the
    // torso regardless of what garment you send it. That's why trousers
    // or skirts came out looking like tops. Rather than silently produce
    // a wrong image, we only offer the free path for tops/outerwear and
    // are upfront about the rest.
    if (!usingReplicate && (product.category === 'bottom' || product.category === 'dress')) {
      return res.status(422).json({
        message:
          'The free try-on model only supports tops and outerwear — it can\u2019t correctly render bottoms or dresses (it always masks the upper body). Add REPLICATE_API_TOKEN in backend/.env to unlock full-category try-on (a few cents per run).',
      });
    }

    const resultImageUrl = usingReplicate
      ? await runViaReplicate({
          garmImg,
          humanImg: userPhotoUrl,
          category: categoryToGarmentType(product.category),
          description: product.name,
        })
      : await runViaHuggingFace({ garmImg, humanImg: userPhotoUrl, description: product.name });

    res.json({ status: 'succeeded', productId, resultImageUrl, provider: usingReplicate ? 'replicate' : 'huggingface' });
  } catch (err) {
    res.status(500).json({ message: 'Try-on generation failed', error: err.message });
  }
};
