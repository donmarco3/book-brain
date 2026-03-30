import React from "react";
import { UserContext } from "..";
import { signOutUser } from "../api";

export default function Account() {
  const { user } = React.useContext(UserContext);
  console.log(user);

  return (
    <>
      <h1>Hello, {user?.displayName}</h1>
      <button onClick={signOutUser} className="btn-lg">
        Logout
      </button>
    </>
  );
}
