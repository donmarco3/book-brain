import React from "react";
import OrbitProgress from "react-loading-indicators/OrbitProgress";

export default function Loading({ text }) {
  return (
    <div className="loading-indicator">
      <OrbitProgress
        variant="track-disc"
        color="#8B6914"
        size="small"
        style={{ fontSize: "8px" }}
      />
      <p className="text-sm">{text}</p>
    </div>
  );
}
