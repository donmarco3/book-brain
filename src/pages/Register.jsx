import React from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router";
import { createNewUser } from "../api";
import { passwordStrength } from "check-password-strength";
import clasnames from "classnames";
import { UserContext } from "..";
import { FaEye } from "react-icons/fa";

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
    const data = await createNewUser(name, email, password);
    console.log(data);
    if (data.signUpError) {
      return { error: data.signUpError.message };
    } else if (data.insertError) {
      return { error: data.insertError.message };
    } else {
      return { user: data.data.user };
    }
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
}

export default function Register() {
  const actionData = useActionData();
  const { setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = React.useState();
  const [password, setPassword] = React.useState("");
  const [strength, setStrength] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    }
    if (actionData?.user) {
      setUser(actionData.user);
      navigate("/");
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
    <>
      <>
        <h1>Register</h1>
        <Form method="post" className="form" replace>
          {errorMessage && <p className="red error">{errorMessage}</p>}
          <label htmlFor="user-name" className="bold">
            Name <span className="required-field">*</span>
          </label>
          <input id="user-name" name="name" placeholder="John" />
          <label htmlFor="user-email" className="bold">
            Email <span className="required-field">*</span>
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            placeholder="name@example.com"
          />
          <label htmlFor="user-password" className="bold">
            Password <span className="required-field">*</span>
            {strength && <span className={classes}>{strength}</span>}
          </label>
          <div className="password-input">
            <input
              id="user-password"
              name="password"
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
                setStrength(passwordStrength(password).value);
              }}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
            >
              <FaEye />
            </button>
          </div>
          <div className="note-buttons">
            <button className="btn-dark ">Create Account</button>
          </div>
        </Form>
      </>
    </>
  );
}
