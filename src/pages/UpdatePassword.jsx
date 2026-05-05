import React from "react";
import { Form, redirect, useActionData } from "react-router";
import { updateUserPassword } from "../api";
import { passwordStrength } from "check-password-strength";
import clasnames from "classnames";

export async function action({ request }) {
  const formData = await request.formData();
  const newPassword = formData.get("password");

  try {
    await updateUserPassword(newPassword);
    return redirect("/");
  } catch (error) {
    return { error };
  }
}

export default function UpdatePassword() {
  const actionData = useActionData();
  const [errorMessage, setErrorMessage] = React.useState();
  const [password, setPassword] = React.useState("");
  const [strength, setStrength] = React.useState("");

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error.message);
    }
  }, [actionData]);

  let strengthColour;
  if (strength === "Too weak" || strength === "Weak") {
    strengthColour = "red";
  } else if (strength === "Medium") {
    strengthColour = "yellow";
  } else {
    strengthColour = "green";
  }
  const classes = clasnames("pill", "bold", strengthColour);

  return (
    <div className="margin-inline">
      <div className="page-heading">
        <h1>Update Password</h1>
        <Form method="post" className="login-form" replace>
          {errorMessage && <p className="red error">{errorMessage}</p>}
          <label htmlFor="user-password">
            New Password <span className="required-field">*</span>
            {strength && <span className={classes}>{strength}</span>}
          </label>
          <input
            className="update-password"
            id="user-password"
            name="password"
            type="password"
            onChange={(e) => {
              setPassword(e.currentTarget.value);
              setStrength(passwordStrength(password).value);
            }}
          />
          <div className="login-form-buttons">
            <button type="submit" className="btn-dark ">
              Login
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
