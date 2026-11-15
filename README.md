# KVIST — Calm Objects for Slow Homes

Multilingual (Kurdish Sorani / Arabic / English) furniture & architectural lighting showroom built with **Next.js App Router**, **Sanity CMS**, interactive **360° turntable** capture & viewer, and **shoppable room hotspot** builder.

## $0 Hosting Stack

You can run the full landing page, Sanity CMS sync, and image asset CDN for **$0/month**:

| Layer | Free Tier Provider | Included Free Allowance |
| :--- | :--- | :--- |
| **App & API Routes** | [Vercel Hobby](https://vercel.com) (or Cloudflare) | Free Next.js hosting, SSL, global edge network |
| **CMS & Image Assets** | [Sanity.io Free Plan](https://www.sanity.io/pricing) | 10 GB media asset storage + 10 GB/mo CDN (`cdn.sanity.io`) + 100k API requests/mo |
| **External Image URLs (Optional)** | Cloudinary Free / ImgBB / `/public/images` | Direct URL connection supported in the Image Asset Picker |

## Connecting Image Assets

1. Create a free project at **sanity.io**.
2. Copy your Project ID, Dataset (`production`), and create an **Editor** API token under **API -> Tokens**.
3. Add these environment variables in `.env.local` (locally) or in your Vercel Project Settings:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   SANITY_API_TOKEN="your_sanity_editor_token"
   ```
4. In `/add` or the **Room Photo & Hotspot Dots** builder, click **Connect Sanity Asset** to:
   - Browse & connect existing images from your Sanity Media Library (`GET /api/sanity/assets`)
   - Upload photos or multi-angle 360° frames individually to Sanity CDN (`POST /api/sanity/assets`) so requests stay compact on serverless free plans
   - Paste any external image CDN URL directly

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
