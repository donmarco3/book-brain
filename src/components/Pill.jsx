import React from "react";
import classnames from "classnames";

export default function Pill({
  children,
  className,
  size,
  colour,
  border,
  ...rest
}) {
  const sizeClass = size && `pill-${size}`;
  const colourClass = colour && `pill-${colour}`;
  const borderClass = border && `pill-${border}`;
  const allClasses = classnames(
    "pill",
    sizeClass,
    colourClass,
    borderClass,
    className,
  );

  return (
    <div className={allClasses} {...rest}>
      {children}
    </div>
  );
}
