import React, { useState, useEffect } from 'react';
import axios from 'axios';

const [prompt, setPrompt] = useState("");
const [imageUrl, setImageUrl] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [apiKey, setApiKey] = useState("");
const [modelId, setModelId] = useState("");
const [inferenceId, setInferenceId] = useState("");
const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
const placeholderText = "lebron james sitting on a throne made of old CRT TVs, palm trees swaying around, city skyline at dusk, pixel clouds, lo-fi synthwave mood, floating cassette tapes, static VCR aesthetic";

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

  setLoading(true);
  setError("");
  setImageUrl("");
  
  try {
    // Prepend the trigger word to the prompt
    const fullPrompt = `LEBRONGOATWAVE ${prompt}`;
    
    // Call our Next.js API route to start image generation
    const response = await axios.post('/api/generate', {
      prompt: fullPrompt,
      apiKey: apiKey,
      modelId: modelId
    });

    console.log('Generate API response:', response.data);

    if (response.data && response.data.inferenceId) {
      // Store the inference ID and start polling
      setInferenceId(response.data.inferenceId);
      startPolling(response.data.inferenceId);
    } else if (response.data && response.data.error) {
      // Handle error response
      setError(`Error: ${response.data.error}. ${response.data.details || ''}`);
      setLoading(false);
    } else {
      setError("Failed to start image generation. Please try again.");
      setLoading(false);
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
    } else if (err.response?.status === 504) {
      setError(`Gateway timeout (504). The request took too long to complete. ${errorDetails}`);
    } else {
      setError(`${errorMessage}: ${errorDetails}`);
    }
    setLoading(false);
  }
};

// Function to start polling for image status
const startPolling = (id: string) => {
  console.log('Starting polling for inference ID:', id);
  
  // Clear any existing polling interval
  if (pollingInterval) {
    console.log('Clearing existing polling interval');
    clearInterval(pollingInterval);
  }
  
  let retryCount = 0;
  const maxRetries = 3;
  const pollInterval = 5000; // 5 seconds between polls
  
  console.log(`Setting up polling with ${pollInterval}ms interval`);
  
  // Set up a new polling interval
  const interval = setInterval(async () => {
    try {
      retryCount++;
      console.log(`Polling attempt ${retryCount} for inference ID: ${id}`);
      
      const statusResponse = await axios.post('/api/check-status', {
        inferenceId: id,
        apiKey: apiKey
      });
      
      console.log('Status check response:', statusResponse.data);
      
      if (statusResponse.data.status === 'ready' && statusResponse.data.output && statusResponse.data.output[0]) {
        console.log('Image is ready:', statusResponse.data.output[0]);
        // Image is ready, display it and stop polling
        setImageUrl(statusResponse.data.output[0]);
        clearInterval(interval);
        setPollingInterval(null);
        setLoading(false);
      } else if (statusResponse.data.status === 'failed') {
        console.log('Image generation failed:', statusResponse.data);
        // Image generation failed
        setError(`Image generation failed: ${statusResponse.data.details || 'Unknown error'}`);
        clearInterval(interval);
        setPollingInterval(null);
        setLoading(false);
      } else if (statusResponse.data.status === 'error') {
        console.log('Status check error:', statusResponse.data);
        // Error checking status
        if (retryCount >= maxRetries) {
          setError(`Error checking status after ${maxRetries} attempts: ${statusResponse.data.details || 'Unknown error'}`);
          clearInterval(interval);
          setPollingInterval(null);
          setLoading(false);
        } else {
          console.log(`Retrying status check (${retryCount}/${maxRetries})...`);
        }
      } else if (statusResponse.data.status === 'processing') {
        console.log('Still processing...');
      }
    } catch (err: any) {
      console.error("Error checking status:", err);
      
      if (retryCount >= maxRetries) {
        setError(`Failed to check status after ${maxRetries} attempts: ${err.message || 'Unknown error'}`);
        clearInterval(interval);
        setPollingInterval(null);
        setLoading(false);
      } else {
        console.log(`Retrying after error (${retryCount}/${maxRetries})...`);
      }
    }
  }, pollInterval);
  
  setPollingInterval(interval);
};

// Clean up polling interval when component unmounts
useEffect(() => {
  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };
}, [pollingInterval]); 