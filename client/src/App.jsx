import { useState } from "react";
import ReactMarkdown from "react-markdown";

// remove trailing slash so we don't end up with //api
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Page Summarizer</h1>
      <p className="subtitle">Paste a link and get a quick summary of the page.</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="url"
          placeholder="https://example.com/some-article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Working..." : "Summarize"}
        </button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading... reading the page and writing a summary</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="card">
          {result.title && <h2>{result.title}</h2>}
          <div className="summary">
            <ReactMarkdown>{result.summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
