# Push this project to GitHub

## 1. Ignore secrets (already set up)

The repo root includes a `.gitignore` that excludes `node_modules`, `.next`, and `**/.env*` files. **Do not** commit `backend/.env`, `frontend/.env.local`, or any file containing API keys.

## 2. Initialize Git (once)

From the project root (`sentiment ai`):

```bash
git init
git add .
git status   # confirm no .env or node_modules listed
git commit -m "Initial commit: Sentiment.ai app and API"
```

## 3. Create a GitHub repository

1. On [GitHub](https://github.com/new), create a new repository (empty, no README if you already committed locally).
2. Copy the remote URL (HTTPS or SSH).

## 4. Connect and push

**HTTPS:**

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

**SSH** (if you use SSH keys):

```bash
git branch -M main
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## 5. After clone (for you or teammates)

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Fill in OPENAI_API_KEY, optional NEWSAPI_KEY, etc.
npm install --prefix frontend
npm install --prefix backend
# From repo root:
npm install
npm run dev
```

## 6. Going live (deploy for real users)

Step-by-step beginner path (Vercel + Railway/Render, env vars, CORS): **[DEPLOY-BEGINNER.md](./DEPLOY-BEGINNER.md)**.
