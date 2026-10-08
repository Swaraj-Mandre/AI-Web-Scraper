# AI Web Scraper

Paste any article link and get a short, readable summary in a few seconds.

The backend visits the page, pulls out the main text and sends it to an AI model (GPT-OSS 120B on Groq), which writes a quick summary with key points.

**Live demo:** ADD_VERCEL_LINK_HERE

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Scraping | Cheerio |
| AI | Groq API (free tier) |
| Hosting | Vercel (frontend), Render (backend) |

## How it works

```
User pastes URL  ->  React app  ->  POST /api/summarize  ->  Express server
                                                               |
                                              fetch page + extract text (Cheerio)
                                                               |
                                                   send text to Groq for summary
                                                               |
                     summary shown on screen  <-  JSON response
```

## Run it locally

You need Node.js 18 or newer and a free Groq API key from https://console.groq.com/keys

**1. Backend**

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder (next to `index.js`). You can copy `server/.env.example`:

```
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=5000
```

```bash
npm start
```

Backend runs on http://localhost:5000

**2. Frontend** (in a second terminal)

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder (copy `client/.env.example`):

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open http://localhost:5173

## API

`POST /api/summarize`

```json
// request
{ "url": "https://example.com/article" }

// response
{ "title": "Page title", "summary": "..." }
```

## Notes

- Works on normal HTML pages. Sites that load content with JavaScript or block bots may not return text.
- Long pages are trimmed to 15000 characters before summarizing.
- The backend is on Render's free plan, so the first request after a while can take around 30 seconds to wake up.
