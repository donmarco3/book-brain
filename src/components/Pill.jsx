import React from "react";
import classnames from "classnames";

export default function Pill({ children, className, size, colour, ...rest }) {
  let sizeClass = size && `pill-${size}`;
  let colourClass = colour && `pill-${colour}`;
  const allClasses = classnames("pill", sizeClass, colourClass, className);

  return (
    <div className={allClasses} {...rest}>
      {children}
    </div>
  );
}
