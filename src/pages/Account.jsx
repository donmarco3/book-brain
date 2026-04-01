import React from "react";
import { UserContext } from "..";
import { resetPassword, signOutUser, updateUserProfile } from "../api";
import { useNavigate, useRevalidator } from "react-router";
import Avatar from "../components/Avatar";

export default function Account() {
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isEditing, setIsEditing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [userName, setUserName] = React.useState(user?.displayName);
  const [userEmail, setUserEmail] = React.useState(user?.email);

  function handleSignOut() {
    signOutUser();
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
        setUser({ ...user, displayName: userName, email: userEmail });
      } catch (error) {
        setErrorMessage(error.message);
        return;
      }
    }
  }

  return (
    <>
      <h1>Hello, {user?.displayName}</h1>
      <div className="card profile-card">
        {!isEditing ? (
          <>
            <Avatar name={user?.displayName} />
            <p className="bold">{user?.displayName}</p>
            <p className="text-sm">{user?.email}</p>
          </>
        ) : (
          <div className="note-editing">
            {errorMessage && <p className="red">{errorMessage}</p>}
            <label htmlFor="user-name" className="bold">
              Name
            </label>
            <input
              id="user-name"
              defaultValue={user?.displayName}
              onChange={(e) => setUserName(e.currentTarget.value)}
            />
            <label htmlFor="user-email" className="bold">
              Email
            </label>
            <input
              id="user-email"
              defaultValue={user?.email}
              onChange={(e) => setUserEmail(e.currentTarget.value)}
            />
            <button
              type="button"
              onClick={() => resetPassword(userEmail)}
              className="btn"
            >
              Reset password
            </button>
          </div>
        )}
        <div className="note-buttons profile-buttons">
          <button onClick={handleClick} className="btn-dark btn-lg">
            {!isEditing ? "Edit Profile" : "Save"}
          </button>
          {isEditing ? (
            <button className="btn-lg" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          ) : null}
        </div>
      </div>
      <button onClick={handleSignOut} className="btn-lg">
        Logout
      </button>
    </>
  );
}
