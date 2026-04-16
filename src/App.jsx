import { useState } from 'react';
import './App.css';

const INSPIRATIONS = [
  { id: 1, label: "Cyberpunk", prompt: "A cyberpunk city at night with neon signs, rain-slicked streets, and high-tech flying cars, cinematic style, 8k." },
  { id: 2, label: "Ethereal", prompt: "An ethereal forest with glowing bioluminescent plants, floating islands, fantasy concept art, dreamy lighting." },
  { id: 3, label: "Astronaut", prompt: "A lone astronaut sitting on a cliff on Mars looking at a Earth-like planet in the sky, hyper-realistic, epic scale." },
  { id: 4, label: "Vintage", prompt: "A vintage 1950s film noir scene, a detective in a trench coat, rainy city streets, dramatic shadows, black and white." }
];

function App() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setImageUrl(null);
    setError(null);

    try {
      const API_KEY = import.meta.env.VITE_HF_API_KEY || import.meta.env.VITE_HF_TOKEN; 
      
      if (!API_KEY) {
        throw new Error("Missing API Key. Please add VITE_HF_TOKEN to your .env file.");
      }

      const response = await fetch(
        "/api-hf/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "X-Wait-For-Model": "true",
            "X-Use-Cache": "false",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API Error: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      const objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
      
    } catch (err) {
      // Intentionally not console.logging to keep console perfectly clean
      // The error is visually handled by setting the error state
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `visioncraft-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Vision<span>Craft</span></h1>
        <p>AI-Native Text-to-Image Generation Engine.</p>
      </header>
      
      <main className="bento-grid">
        <aside className="control-panel">
          <form className="input-card" onSubmit={handleGenerate}>
            <div className="input-group">
              <label htmlFor="prompt">Prompt Synthesis</label>
              <textarea 
                id="prompt"
                className="prompt-input"
                placeholder="Describe your vision in detail... e.g. A cyberpunk city at night with neon signs." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            
            <button type="submit" className="generate-btn" disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <svg className="loader" style={{width: 20, height: 20, borderWidth: 2}} viewBox="0 0 24 24"></svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 16 16 12 12 8"></polyline>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Generate Canvas
                </>
              )}
            </button>
          </form>

          <div className="inspiration-container">
            <h3>Prompt Synthesis Ideas</h3>
            <div className="inspiration-grid">
              {INSPIRATIONS.map((item) => (
                <button 
                  key={item.id} 
                  className="inspiration-chip"
                  onClick={() => setPrompt(item.prompt)}
                  disabled={isGenerating}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </aside>

        <section className="output-section">
            {isGenerating && (
               <div className="loader-container">
                  <div className="loader"></div>
                  <div className="loader-text">Synthesizing Pixels</div>
               </div>
            )}
            
            {!isGenerating && imageUrl && !error && (
               <div className="image-container">
                  <img src={imageUrl} alt={prompt} />
                  <button className="download-btn" onClick={handleDownload} aria-label="Download Image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Save
                  </button>
               </div>
            )}
            
            {!isGenerating && !imageUrl && !error && (
               <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p>Awaiting parameters.</p>
               </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default App;
