

import React, { useEffect, useState } from "react";

const RealEsateLoadingIndicator = () => {
  const [dots, setDots] = useState("");
  const [message, setMessage] = useState("Loading");
  const messages = [
    "Curating properties",
    "Finding the best matches",
    "Analyzing listings",
    "Preparing results"
  ];

  // Animate dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prevDots) => {
        return prevDots.length >= 3 ? "" : prevDots + ".";
      });
    }, 400);

    return () => clearInterval(dotInterval);
  }, []);

  // Cycle through different messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessage((prevMessage) => {
        const currentIndex = messages.findIndex(m => m === prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="flex flex-col items-left py-6">
      <div className="flex space-x-2 mb-3">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
      </div>
      <div className="text-gray-300 font-medium">
        {message}<span className="inline-block w-6 text-left">{dots}</span>
      </div>
    </div>
  );
};

export default RealEsateLoadingIndicator;