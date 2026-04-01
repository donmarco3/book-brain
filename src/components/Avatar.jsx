import React from "react";

export default function Avatar({ name }) {
  const firstLetter = name.charAt(0);

  return (
    <div className="avatar">
      <div>{firstLetter}</div>
    </div>
  );
}
