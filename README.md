# THREAD — AI Fitting Room (Full Stack)

A shopping app where you try on catalogue items on your own body profile, get full outfit
suggestions matched to skin tone / undertone / body type / height / occasion, and keep a
digital record of what you already own.

## Stack

- **Frontend:** React (Vite) + React Router — no CSS framework, custom design system in `src/global.css`
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT + bcrypt password hashing

## Project structure

```
thread-app/
  backend/
    config/db.js          Mongo connection
    models/                User, Product, WardrobeItem, Outfit
    controllers/            business logic per resource
    routes/                 Express routers
    middleware/auth.js      JWT protect middleware
    server.js                entrypoint
    seed.js                   loads 5 sample products
  frontend/
    src/
      pages/               Home, Login, Register, Catalog, Wardrobe, Outfits
      components/          Navbar, GarmentStage (the 3D hero garment), ProtectedRoute
      context/AuthContext.jsx
      api/client.js         axios instance with JWT attached
```

## Running it locally

### 1. Database
You need a MongoDB instance. Easiest options:
- Install MongoDB Community locally and run `mongod`, **or**
- Use a free MongoDB Atlas cluster and grab its connection string.

### 2. Backend
```bash
cd backend
cp .env.example .env       # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed                # loads 5 sample products so the catalog isn't empty
npm run dev                 # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to :5000
```

Open `http://localhost:5173`. Register an account (it asks for skin tone, undertone, body
type, and height right at signup — this is what powers outfit matching), browse the shop,
add items to your wardrobe, and hit "Suggest an Outfit" on the Outfits page.

## API overview

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | create account |
| POST | `/api/auth/login` | – | get JWT |
| GET | `/api/auth/me` | ✓ | current user |
| PUT | `/api/auth/profile` | ✓ | set skin tone / height / body type / undertone |
| GET | `/api/products?category=&occasion=&skinTone=` | – | browse/filter catalog |
| GET | `/api/products/:id` | – | single product |
| POST | `/api/products` | – | add product (seed/admin use) |
| GET | `/api/wardrobe` | ✓ | list your closet |
| POST | `/api/wardrobe` | ✓ | log an owned item |
| PUT | `/api/wardrobe/:id/worn` | ✓ | mark worn today |
| DELETE | `/api/wardrobe/:id` | ✓ | remove item |
| GET | `/api/outfits/suggest?occasion=` | ✓ | AI-style matched outfit |
| POST | `/api/outfits` | ✓ | save a chosen outfit |
| GET | `/api/outfits` | ✓ | list saved outfits |
| POST | `/api/tryon` | ✓ | stub — see note below |

## What's real vs. stubbed

**Real and working:** auth, product catalog + filtering, wardrobe CRUD, and the outfit
matcher (`controllers/outfitController.js`) — a transparent, rule-based scoring function
that ranks products against the signed-in user's profile and requested occasion. It's a
genuine v1 recommendation engine, not a mock.

**Stubbed:** `/api/tryon` — actually compositing a garment onto a photo of a real body is a
computer vision problem (pose estimation + garment warping, or a hosted diffusion-based
try-on model), not something that belongs in a weekend CRUD build. The controller has
comments on the two realistic implementation paths. Wire in a hosted try-on API
(e.g. via Replicate/HuggingFace) behind that same route and nothing else in the app needs
to change.

**Product images:** the seed data and catalog UI currently placeholder image slots — drop
real product photo URLs into `seed.js` or upload via your own storage (S3/Cloudinary) and
point `images: []` at them.

## Next steps worth doing, in order

1. Wire a real image upload flow (Cloudinary/S3) for products and wardrobe items.
2. Pick and integrate a real try-on model behind `/api/tryon`.
3. Turn the outfit scorer into something that learns from saved/liked outfits over time.
4. Add pagination to `/api/products` once the catalog is more than a handful of items.
