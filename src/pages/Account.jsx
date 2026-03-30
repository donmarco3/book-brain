import React from "react";
import { UserContext } from "..";
import { signOutUser } from "../api";
import { useNavigate } from "react-router";

export default function Account() {
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();

  function handleSignOut() {
    console.log("button clicked");
    signOutUser();
    return navigate("/login");
  }

  return (
    <>
      <h1>Hello, {user?.displayName}</h1>
      <button onClick={handleSignOut} className="btn-lg">
        Logout
      </button>
    </>
  );
}
