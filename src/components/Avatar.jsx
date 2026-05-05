import classNames from "classnames";
import React from "react";

export default function Avatar({ name, size }) {
  const firstLetter = name.charAt(0);
  const sizeClass = size && `avatar-${size}`;
  const allClasses = classNames("avatar", sizeClass);

  return (
    <div className={allClasses}>
      <div>{firstLetter}</div>
    </div>
  );
}
