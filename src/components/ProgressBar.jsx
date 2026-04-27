import React from "react";

export default function ProgressBar({ progress }) {
  const wrapperStyles = {
    width: "100%",
    backgroundColor: "rgba(107, 30, 46, 0.12)",
    borderRadius: "10px",
  };

  const innerStyles = {
    width: `${progress}%`,
    backgroundColor: "#6B1E2E",
    height: "5px",
    borderRadius: "inherit",
    transition: "width 0.3s ease-in-out",
  };

  return (
    <div style={wrapperStyles}>
      <div style={innerStyles} />
    </div>
  );
}
