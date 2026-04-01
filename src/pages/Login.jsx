import React from "react";
import { Form, Link, redirect, useActionData } from "react-router";
import { resetPassword, signInUser } from "../api";

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "All fields are required" };
  }

  try {
    await signInUser(email, password);
    return redirect("/");
  } catch (error) {
    return { error: "User not found" };
  }
}

export default function Login() {
  const actionData = useActionData();

  const [errorMessage, setErrorMessage] = React.useState();
  const [userEmail, setUserEmail] = React.useState("");

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    }
  }, [actionData]);

  function handleClick() {
    if (userEmail === "") {
      setErrorMessage("Must enter email");
    }
    resetPassword(userEmail);
  }

  return (
    <>
      <div className="log-header">
        <h1>Login</h1>
        <Form method="post" className="login-form" replace>
          {errorMessage && <p className="red error">{errorMessage}</p>}
          <label htmlFor="user-email">
            Email <span className="required-field">*</span>
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            onChange={(e) => setUserEmail(e.currentTarget.value)}
          />
          <label htmlFor="user-password">
            Password <span className="required-field">*</span>
          </label>
          <input id="user-password" name="password" type="password" />
          <div className="login-form-buttons">
            <button type="button" onClick={handleClick} className="btn">
              Forgot your password?
            </button>
            <button type="submit" className="btn-dark btn-lg">
              Login
            </button>
          </div>
        </Form>
        <Link to="/register" className="link-btn">
          Register
        </Link>
      </div>
    </>
  );
}
