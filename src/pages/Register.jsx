import React from "react";
import { Form, Link, redirect, useActionData, useNavigate } from "react-router";
import { createNewUser } from "../api";
import { passwordStrength } from "check-password-strength";
import clasnames from "classnames";
import { UserContext } from "..";
import { FaEye } from "react-icons/fa";
import { SizeContext } from "../components/Layout";
import Pill from "../components/Pill";

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
  const size = React.useContext(SizeContext);
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
    strengthColour = "pill-red";
  } else if (strength === "Medium") {
    strengthColour = "pill-gold";
  } else {
    strengthColour = "pill-green";
  }
  const classes = clasnames("pill", strengthColour);

  return (
    <div className={size === "large" ? "margin-inline" : "margin-inline-sm"}>
      <h1>Register</h1>
      <Form method="post" className="form" replace>
        {errorMessage && <p className="red error">{errorMessage}</p>}
        <label htmlFor="user-name" className="gold">
          Name
        </label>
        <input id="user-name" name="name" placeholder="John" />
        <label htmlFor="user-email" className="gold">
          Email
        </label>
        <input
          id="user-email"
          name="email"
          type="email"
          placeholder="name@example.com"
        />
        <label htmlFor="user-password" className="gold flex-row gap-lg">
          Password
          {strength && <Pill className={classes}>{strength}</Pill>}
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
      <div className="register-container">
        <p className="text-sm register-message">
          If you already have an account, log in here.
        </p>
        <Link to="/login" className="link-btn">
          Login
        </Link>
      </div>
    </div>
  );
}
