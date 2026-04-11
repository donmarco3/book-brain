import React from "react";
import { Form, Link, useActionData, useNavigate } from "react-router";
import { sendResetPasswordEmail, signInUser } from "../api";
import { UserContext } from "..";
import { FaEye } from "react-icons/fa";

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "All fields are required" };
  }

  try {
    const data = await signInUser(email, password);
    console.log(data.data);
    if (!data.data.user) {
      return { error: data.error.message };
    }
    return { user: data.data.user };
  } catch (error) {
    return { error };
  }
}

export default function Login() {
  const actionData = useActionData();
  const { setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = React.useState();
  const [userEmail, setUserEmail] = React.useState("");
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

  async function handleClick() {
    try {
      const data = await sendResetPasswordEmail(userEmail);
      if (!data.data) {
        setErrorMessage(data.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="log-header">
        <h1>Login</h1>
        <Form method="post" className="login-form" replace>
          {errorMessage && <p className="red error">{errorMessage}</p>}
          <label htmlFor="user-email" className="bold">
            Email <span className="required-field">*</span>
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            onChange={(e) => setUserEmail(e.currentTarget.value)}
          />
          <label htmlFor="user-password" className="bold">
            Password <span className="required-field">*</span>
          </label>
          <div className="password-input">
            <input
              id="user-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
            >
              <FaEye />
            </button>
          </div>
          <div className="login-form-buttons">
            <button type="button" onClick={handleClick} className="btn">
              Forgot your password?
            </button>
            <button type="submit" className="btn-dark btn-lg">
              Login
            </button>
          </div>
        </Form>
        <p className="text-sm register-message">
          If you don't have an account register here.
        </p>
        <Link to="/register" className="link-btn">
          Register
        </Link>
      </div>
    </>
  );
}
