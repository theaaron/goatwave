"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("");

  useEffect(() => {
    // Get API key and model ID from environment variables
    setApiKey(process.env.NEXT_PUBLIC_BLACKFOREST_API_KEY || "");
    setModelId(process.env.NEXT_PUBLIC_MODEL_ID || "");
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (!apiKey) {
      setError("API key is missing. Please check your .env.local file.");
      return;
    }

    if (!modelId) {
      setError("Model ID is missing. Please check your .env.local file.");
      return;
    }

    // Basic validation for API key format
    // if (!apiKey.startsWith('bfl_')) {
    //   setError("Invalid API key format. BlackForestLabs API keys should start with 'bfl_'");
    //   return;
    // }

    setLoading(true);
    setError("");
    
    try {
      // Prepend the trigger word to the prompt
      const fullPrompt = `LEBRONGOATWAVE ${prompt}`;
      
      // Call our Next.js API route instead of the BlackForestLabs API directly
      const response = await axios.post('/api/generate', {
        prompt: fullPrompt,
        apiKey: apiKey,
        modelId: modelId
      });

      if (response.data && response.data.output && response.data.output[0]) {
        setImageUrl(response.data.output[0]);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err: any) {
      console.error("Error generating image:", err);
      
      // Extract error details from the response
      let errorMessage = "An error occurred";
      let errorDetails = "";
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data.error || errorMessage;
        errorDetails = err.response.data.details || "";
      } else {
        errorDetails = err.message || "Unknown error";
      }
      
      // Provide more helpful error messages based on the error type
      if (err.response?.status === 403) {
        setError(`Authentication failed (403). ${errorDetails}`);
      } else if (err.response?.status === 401) {
        setError(`Unauthorized (401). Your API key may be invalid or expired. ${errorDetails}`);
      } else if (err.response?.status === 400) {
        setError(`Bad request (400). ${errorDetails}`);
      } else if (err.response?.status === 404) {
        setError(`Not found (404). The API endpoint may be incorrect. ${errorDetails}`);
      } else if (err.response?.status === 429) {
        setError(`Rate limited (429). You may have exceeded your API quota. ${errorDetails}`);
      } else if (err.response?.status === 500) {
        setError(`Server error (500). The API server encountered an error. ${errorDetails}`);
      } else {
        setError(`${errorMessage}: ${errorDetails}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testApiRoute = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Test the simple API route
      const response = await axios.post('/api/test', {
        test: 'data'
      });
      
      console.log('Test API response:', response.data);
      setError("API route test successful: " + JSON.stringify(response.data));
    } catch (err: any) {
      console.error("Error testing API route:", err);
      setError("API route test failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 
            className="text-5xl md:text-7xl font-bold vaporwave-title mb-4"
            data-text="GOATWAVE"
          >
            GOATWAVE
            <span className="vaporwave-title-trail-1">GOATWAVE</span>
            <span className="vaporwave-title-trail-2">GOATWAVE</span>
            <span className="vaporwave-title-trail-3">GOATWAVE</span>
            <span className="vaporwave-title-trail-4">GOATWAVE</span>
            <span className="vaporwave-title-trail-5">GOATWAVE</span>
            <span className="vaporwave-title-trail-6">GOATWAVE</span>
            <span className="vaporwave-title-trail-7">GOATWAVE</span>
            <span className="vaporwave-title-trail-8">GOATWAVE</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#4a9e7d]">
            Generate stunning vaporwave-style images with AI
          </p>
        </header>

        <div className="pastel-card p-6 md:p-8 rounded-lg mb-8">
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-lg mb-2 text-[#333]">
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              className="pastel-input w-full p-3 rounded-md h-32"
              placeholder="lebron james sitting on a throne made of old CRT TVs, palm trees swaying around, city skyline at dusk, pixel clouds, lo-fi synthwave mood, floating cassette tapes, static VCR aesthetic"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {/* <p className="text-sm mt-2 text-[#333]">
              Note: "LEBRONGOATWAVE" will be automatically added to your prompt
            </p> */}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              className="pastel-button px-8 py-3 rounded-md text-lg font-bold"
              onClick={generateImage}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Image"}
            </button>
            
            <button
              className="pastel-button px-8 py-3 rounded-md text-lg font-bold"
              onClick={testApiRoute}
              disabled={loading}
            >
              Test API
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-center">{error}</div>
          )}
        </div>

        {loading && (
          <div className="pastel-card p-6 md:p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center pastel-text">
              Generating Your Image
            </h2>
            <div className="relative flex justify-center">
              <div className="w-full max-w-3xl aspect-[4/3] bg-gradient-to-r from-[#ffb5e8] to-[#b5e0ff] rounded-md blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#4a9e7d] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="mt-4 text-center text-[#333]">
              This may take a minute or two. Please be patient...
            </p>
          </div>
        )}

        {imageUrl && (
          <div className="pastel-card p-6 md:p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center pastel-text">
              Your Generated Image
            </h2>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Generated vaporwave image"
                className="max-w-full h-auto rounded-md shadow-lg"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <a
                href={imageUrl}
                download="goatwave-image.png"
                className="pastel-button px-6 py-2 rounded-md text-sm font-medium"
              >
                Download Image
              </a>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-sm opacity-70">
        <p className="text-[#4a9e7d]">Powered by BlackForestLabs API</p>
        <p className="mt-2">© {new Date().getFullYear()} GOATWAVE</p>
      </footer>
    </div>
  );
}
