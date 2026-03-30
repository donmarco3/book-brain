import React from "react";
import { Form, Link, redirect, useActionData } from "react-router";
import { createNewUser } from "../api";

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    await createNewUser(name, email, password);
    return redirect("/");
  } catch (error) {
    return { error: "Error creating new user" };
  }
}

export default function Register() {
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
        <h1>Register</h1>
        <Form method="post" className="login-form" replace>
          {errorMessage && <p className="red error">{errorMessage}</p>}
          <label htmlFor="user-name">
            Name <span className="required-field">*</span>
          </label>
          <input id="user-name" name="name" placeholder="John" />
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
          <button className="btn-dark btn-lg">Create Account</button>
        </Form>
      </div>
    </>
  );
}
