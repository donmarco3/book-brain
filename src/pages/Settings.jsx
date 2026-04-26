import React from "react";
import {
  getUser,
  sendResetPasswordEmail,
  signOutUser,
  updateUserProfile,
} from "../api";
import { useLoaderData, useNavigate } from "react-router";
import { UserContext } from "..";
import Avatar from "../components/Avatar";

export async function loader() {
  const userProfile = await getUser();
  return { userProfile };
}

export default function Settings() {
  const { userProfile } = useLoaderData();
  const { setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [userName, setUserName] = React.useState(userProfile.name);
  const [userEmail, setUserEmail] = React.useState(userProfile.email);

  function handleSignOut() {
    signOutUser();
    setUser(undefined);
    return navigate("/login");
  }

  function handleClick() {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      if (!userName) {
        setErrorMessage("Name is required");
        return;
      }
      if (!userEmail) {
        setErrorMessage("Email is required");
        return;
      }

      try {
        updateUserProfile(userName, userEmail);
        setIsEditing(false);
      } catch (error) {
        setErrorMessage(error.message);
        return;
      }
    }
  }

  async function handlePasswordReset() {
    try {
      const data = await sendResetPasswordEmail(userEmail);
      if (!data.data) {
        setErrorMessage(data.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const accountButtons = (
    <>
      <div className="note-buttons profile-buttons">
        <button onClick={handleClick} className="btn-dark">
          {!isEditing ? "Edit Profile" : "Save"}
        </button>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <h1>Hello, {userProfile.name}</h1>
      {!isEditing ? (
        <div className="card profile-card">
          <Avatar name={userProfile.name} />
          <p className="bold">{userProfile.name}</p>
          <p className="text-sm">{userProfile.email}</p>
          {accountButtons}
          <button onClick={handleSignOut}>Logout</button>
        </div>
      ) : (
        <div className="form">
          {errorMessage && <p className="red">{errorMessage}</p>}
          <label htmlFor="user-name" className="bold">
            Name
          </label>
          <input
            id="user-name"
            defaultValue={userProfile.name}
            onChange={(e) => setUserName(e.currentTarget.value)}
          />
          <label htmlFor="user-email" className="bold">
            Email
          </label>
          <input
            id="user-email"
            defaultValue={userProfile.email}
            onChange={(e) => setUserEmail(e.currentTarget.value)}
          />
          <button
            type="button"
            className="reset-password-btn"
            onClick={handlePasswordReset}
          >
            Reset password
          </button>
          <p className="text-sm">
            Check your current email to confirm your updated email.
          </p>
          {accountButtons}
        </div>
      )}
    </>
  );
}
