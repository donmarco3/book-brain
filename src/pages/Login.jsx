import React from "react";
import { Form, Link, redirect, useActionData } from "react-router";
import { signInUser } from "../api";

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

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    }
  }, [actionData]);

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
          />
          <label htmlFor="user-password">
            Password <span className="required-field">*</span>
          </label>
          <input id="user-password" name="password" type="password" />
          <button className="btn-dark btn-lg">Login</button>
        </Form>
        <Link to="/register" className="link-btn">
          Register
        </Link>
      </div>
    </>
  );
}
