import React from "react";
import {
  getAllBooks,
  getAllNotes,
  getUser,
  sendResetPasswordEmail,
  signOutUser,
  updateUserProfile,
} from "../api";
import { Link, useLoaderData, useNavigate } from "react-router";
import { UserContext } from "..";
import Avatar from "../components/Avatar";

export async function loader() {
  const userProfile = await getUser();
  const books = await getAllBooks();
  const notes = await getAllNotes();
  return { userProfile, books, notes };
}

export default function Account() {
  const { userProfile, books, notes } = useLoaderData();
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
    <div className="margin-inline">
      <div className="page-heading">
        <h1>Account</h1>
      </div>
      {!isEditing ? (
        <>
          <div className="card flex-row align-center margin-block">
            <Avatar name={userProfile.name} />
            <div className="padding-inline">
              <h2>{userProfile.name}</h2>
              <p>{userProfile.email}</p>
              <p className="italic">
                Member since{" "}
                {new Date(userProfile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="card card-red margin-block">
            <div>
              <p>Your Library at a Glance</p>
            </div>
            <div className="flex-row space-evenly">
              <div className="flex-col align-center padding-inline padding-block width-3rd">
                <p className="number">{books.length}</p>
                <p className="italic">books logged</p>
              </div>
              <div className="flex-col align-center padding-inline padding-block width-3rd border-side">
                <p className="number">{notes.length}</p>
                <p className="italic">notes logged</p>
              </div>
              <div className="flex-col align-center padding-inline padding-block width-3rd">
                <p className="number gold">14</p>
                <p className="italic">day streak</p>
              </div>
            </div>
          </div>

          <div className="card card-red margin-block">
            <div>
              <p>Account</p>
            </div>
            <div
              onClick={() => setIsEditing(true)}
              className="flex-row space-between align-center padding-block padding-inline cursor-pointer"
            >
              <div>
                <p>Edit profile</p>
                <p className="italic">Update your profile details</p>
              </div>
              <span>&rarr;</span>
            </div>
          </div>

          <div className="card card-red margin-block">
            <div>
              <p>Preferences</p>
            </div>
            <Link
              to={"/manage-buckets"}
              className="flex-row space-between align-center padding-block padding-inline"
            >
              <div>
                <p>Manage buckets</p>
                <p className="italic">Add, edit, or remove your note buckets</p>
              </div>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="note-buttons margin-block">
            <button onClick={handleSignOut} className="width-100">
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="margin-block form">
          {errorMessage && <p className="red margin-bottom">{errorMessage}</p>}
          <label htmlFor="user-name" className="gold">
            Name
          </label>
          <input
            id="user-name"
            defaultValue={userProfile.name}
            onChange={(e) => setUserName(e.currentTarget.value)}
          />
          <label htmlFor="user-email" className="gold">
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
          <p className="text-sm margin-top">
            Check your current email to confirm your updated email.
          </p>
          {accountButtons}
        </div>
      )}
    </div>
  );
}
