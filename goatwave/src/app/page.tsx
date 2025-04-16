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

  useEffect(() => {
    // Get API key from environment variables
    setApiKey(process.env.NEXT_PUBLIC_BLACKFOREST_API_KEY || "");
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

    setLoading(true);
    setError("");
    
    try {
      // Replace with your actual BlackForestLabs API endpoint and model ID
      const response = await axios.post(
        "https://api.blackforestlabs.com/v1/generation",
        {
          prompt: prompt,
          model_id: "YOUR_MODEL_ID", // Replace with your specific model ID
          negative_prompt: "ugly, blurry, low quality, distorted",
          width: 768,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
        }
      );

      if (response.data && response.data.output && response.data.output[0]) {
        setImageUrl(response.data.output[0]);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("An error occurred while generating the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold vaporwave-text glitch-text mb-4">
            GOATWAVE
          </h1>
          <p className="text-xl md:text-2xl text-secondary">
            Generate stunning vaporwave-style images with AI
          </p>
        </header>

        <div className="vaporwave-card p-6 md:p-8 rounded-lg mb-8">
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-lg mb-2">
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              className="vaporwave-input w-full p-3 rounded-md h-32"
              placeholder="A neon-lit cityscape with palm trees and retro cars..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <button
              className="vaporwave-button px-6 py-3 rounded-md text-lg font-bold"
              onClick={generateImage}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Image"}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-center">{error}</div>
          )}
        </div>

        {imageUrl && (
          <div className="vaporwave-card p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center vaporwave-text">
              Your Generated Image
            </h2>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Generated vaporwave image"
                className="max-w-full h-auto rounded-md"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <a
                href={imageUrl}
                download="goatwave-image.png"
                className="vaporwave-button px-4 py-2 rounded-md text-sm"
              >
                Download Image
              </a>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-sm opacity-70">
        <p>Powered by BlackForestLabs API</p>
        <p className="mt-2">© {new Date().getFullYear()} GOATWAVE</p>
      </footer>
    </div>
  );
}
