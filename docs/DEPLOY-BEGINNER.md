# Going live (beginner-friendly)

Your app has **two parts** that must both run on the internet:

1. **Frontend** — Next.js (`frontend/`)
2. **Backend** — Express API (`backend/`) — holds `OPENAI_API_KEY` and talks to OpenAI, NewsAPI, Frankfurter

The browser only talks to the **frontend**; the frontend calls the **backend** using `NEXT_PUBLIC_API_URL`.  
Deploy the **API first**, then the **frontend**, then connect them with env vars.

---

## Recommended path (simplest for beginners)

| Part | Common choice | Why |
|------|----------------|-----|
| Frontend | **[Vercel](https://vercel.com)** | Built for Next.js, connects to GitHub in a few clicks, free tier for hobby projects. |
| Backend | **[Railway](https://railway.app)** or **[Render](https://render.com)** | Run a Node server without managing Linux yourself; both have free/low-cost tiers. |

Alternatives: **Netlify** (frontend) + **Fly.io** (backend) — same idea.

---

## Step-by-step (high level)

### 1. Put code on GitHub

See [GITHUB.md](./GITHUB.md). You need a repo Vercel/Railway can read.

### 2. Deploy the backend (Express)

1. Create an account on Railway or Render.
2. **New project** → **Deploy from GitHub** → pick this repo.
3. Set **root directory** to `backend` (or use their monorepo settings so the start command runs in `backend`).
4. **Start command** (examples): `npm start` or `node server.js` — match what `backend/package.json` uses.
5. Add **environment variables** in the dashboard (same names as `backend/.env.example`):
   - `OPENAI_API_KEY` — **required** for real analysis
   - `NEWSAPI_KEY` — optional
   - `PORT` — often set automatically by the host; if not, `4000` is fine
   - **`CORS_ORIGIN`** — your **frontend URL** once you know it (see step 3). Until then you can use a placeholder and update after frontend deploy.

6. Deploy and copy the **public URL** of the API (e.g. `https://something.railway.app`).

### 3. Deploy the frontend (Next.js)

1. Create an account on **Vercel**.
2. **Import** the same GitHub repo.
3. Set **Root Directory** to **`frontend`** (Project → **Settings** → **General** → **Root Directory**).  
   **Required for this repo.** If it stays at `.` (repo root), Vercel only installs the root `package.json` and the build fails with **`next: not found`** because dependencies in `frontend/` were never installed.
4. **Environment variable:**
   - `NEXT_PUBLIC_API_URL` = your **backend URL** from step 2 (no trailing slash), e.g. `https://your-api.railway.app`

5. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### 4. Finish CORS

In the **backend** host’s env vars, set:

- `CORS_ORIGIN` = your **Vercel URL** (exact origin, e.g. `https://your-app.vercel.app`)

If the platform allows multiple origins, you can add preview URLs later. Redeploy the API after changing env.

### 5. Test

Open the Vercel URL in a browser, run an analysis, and check the browser **Network** tab: requests should go to your API host, not `localhost`.

---

## What you pay

- **Free tiers** are enough to learn and share with friends; they have sleep/cold-start or usage limits.
- **OpenAI** bills by usage — set [usage limits](https://platform.openai.com/account/billing/limits) in the OpenAI dashboard.
- **NewsAPI** has a free developer quota.

---

## Custom domain (optional)

Buy a domain (Namecheap, Google Domains, Cloudflare, etc.), then:

- In **Vercel**: add the domain to the project and follow DNS instructions.
- Point **API** subdomain (e.g. `api.yourdomain.com`) to Railway/Render using their custom-domain docs.

---

## One-server alternative (more advanced)

You could run **Next.js + API in one Node process** (custom server or serverless routes) so there is only one deploy — that requires code changes. The **two-service** setup above matches your current repo with minimal changes.
