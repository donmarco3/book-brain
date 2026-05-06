import classNames from "classnames";
import React from "react";
import { UserContext } from "..";

export default function Avatar({ size }) {
  const { user, isLoading } = React.useContext(UserContext);

  let username;
  if (isLoading) {
    username = "";
  } else if (!isLoading && user) {
    username = user.userInfo.name;
  }

  const sizeClass = size && `avatar-${size}`;
  const allClasses = classNames("avatar", sizeClass);

  return (
    <div className={allClasses}>
      <div>{username.charAt(0)}</div>
    </div>
  );
}
