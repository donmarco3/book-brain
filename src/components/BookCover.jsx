import classNames from "classnames";
import React from "react";

export default function BookCover({ image, size }) {
  const sizeClass = size && `book-image-${size}`;
  const classes = classNames("book-image", sizeClass);

  return (
    <div className={classes}>{image ? <img src={image} /> : <div></div>}</div>
  );
}
