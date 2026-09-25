# 🚀 Deploying WriteWise

WriteWise is built as a lightning-fast, state-of-the-art **React & Vite Single Page Application (SPA)**. All state management, simulation logs, expert registries, and scaffolding pathways execute and persist client-side via browser `localStorage`. 

This architecture makes WriteWise **100% serverless, secure, lightweight, and completely free to deploy** on any static web host.

---

## ⚡ Option 1: Vercel (Recommended — 1 Minute)
Vercel is the easiest and most robust host for React Vite applications.

1. **Push your code** to a GitHub, GitLab, or Bitbucket repository.
2. Go to [Vercel](https://vercel.com/) and log in (free account).
3. Click **Add New** > **Project**.
4. Import your WriteWise repository.
5. Vercel automatically detects **Vite** as the framework:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**. Your app is live in seconds with a custom `.vercel.app` URL!

*Note: The included `vercel.json` ensures page reloads are handled correctly by rewriting traffic back to the single-page router.*

---

## 🕸️ Option 2: Netlify (1 Minute)
Netlify provides excellent continuous deployment directly from your git repository.

1. **Push your code** to GitHub.
2. Log in to [Netlify](https://www.netlify.com/) (free account).
3. Click **Add new site** > **Import an existing project**.
4. Choose GitHub and select your repository.
5. Settings will be pre-configured:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy site**.

*Note: The included `netlify.toml` and `public/_redirects` files prevent "404 Not Found" issues on route changes.*

---

## 🐙 Option 3: GitHub Pages (Free Hosting with GitHub)
Deploy your application directly to your GitHub portfolio for free.

### Step-by-Step GitHub Actions Deployment:
1. Go to your repository **Settings** on GitHub.
2. In the sidebar, select **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Create a new file in your repository at `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-size: 20
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. Push the file to the `main` branch. GitHub Actions will build and deploy the app directly to `https://<your-username>.github.io/<your-repo-name>/`.

---

## ☁️ Option 4: Cloudflare Workers & Pages

### A. Deploy via Cloudflare Workers CLI (wrangler)
The app includes a pre-configured `wrangler.json` with Cloudflare Workers Static Assets:
1. Build and deploy in one step:
   ```bash
   npm run deploy
   ```
   *(or `npm run build && npx wrangler deploy`)*
2. Wrangler will read `wrangler.json`, upload the compiled `./dist` directory, and enable `single-page-application` routing so all JavaScript/CSS assets load properly without MIME type errors.

### B. Deploy via Cloudflare Pages Dashboard
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. Cloudflare Pages automatically provides Single Page Application routing for Vite apps.

---

## 🛠️ Local Development & Previews
To run a production-ready preview locally before hosting:
```bash
# Build the project
npm run build

# Preview locally
npm run preview
```
