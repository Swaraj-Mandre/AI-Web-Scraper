# Page Summarizer

A small full stack app that takes a webpage URL, scrapes the text from it and uses the Google Gemini API to write a short summary.

**Live demo:** ADD_VERCEL_LINK_HERE

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Scraping:** Cheerio (plain HTML parsing, no headless browser)
- **AI:** Google Gemini API (free tier)

## How it works

1. You paste a URL in the input box and click **Summarize**.
2. The frontend sends a POST request to `/api/summarize` on the backend.
3. The backend fetches the page, strips out scripts, styles, nav, footer etc. and pulls the text from headings, paragraphs and list items.
4. The text is sent to Gemini with a prompt asking for a short summary and a few key points.
5. The summary is sent back and shown on the page. A loading spinner shows while this is happening.

## Project structure

```
.
├── client/          React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   └── .env.example
├── server/          Express backend
│   ├── index.js
│   └── .env.example
└── README.md
```

## Running locally

You need Node.js 18 or newer.

### 1. Get a free Gemini API key

Go to https://aistudio.google.com/apikey, sign in with a Google account and create a key. No card needed.

### 2. Start the backend

```bash
cd server
npm install
```

Create a file called `.env` **inside the `server` folder** (same place as `index.js`). You can copy `server/.env.example`:

```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
```

Then run:

```bash
npm start
```

The API will be running at http://localhost:5000

### 3. Start the frontend

Open a second terminal:

```bash
cd client
npm install
```

Create a file called `.env` **inside the `client` folder** (copy `client/.env.example`):

```
VITE_API_URL=http://localhost:5000
```

Then run:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## API

`POST /api/summarize`

Request body:

```json
{ "url": "https://example.com/article" }
```

Response:

```json
{ "title": "Page title", "summary": "Short summary text..." }
```

On failure it returns an `error` field with a message.

## Deployment

- Backend is deployed on **Render** as a Web Service (root directory `server`, build command `npm install`, start command `npm start`, with `GEMINI_API_KEY` added as an environment variable).
- Frontend is deployed on **Vercel** (root directory `client`, with `VITE_API_URL` set to the Render URL).

Note: Render's free plan puts the server to sleep after some inactivity, so the first request can take around 30 to 50 seconds.

## Limitations

- Only reads plain HTML. Sites that load their content with JavaScript, or that block bots, may return little or no text.
- Very long pages are cut to the first 15000 characters before being sent to the AI.
