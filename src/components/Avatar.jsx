import classNames from "classnames";
import React from "react";
import { UserContext } from "..";

export default function Avatar({ size }) {
  const { userProfile, isLoading } = React.useContext(UserContext);

  let username;
  if (!isLoading && userProfile) {
    username = userProfile.name;
  } else {
    username = "";
  }

  const sizeClass = size && `avatar-${size}`;
  const allClasses = classNames("avatar", sizeClass);

  return (
    <div className={allClasses}>
      <div>{username.charAt(0)}</div>
    </div>
  );
}
