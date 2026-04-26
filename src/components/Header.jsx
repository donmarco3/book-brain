import React from "react";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "..";

export default function Header() {
  const { user } = React.useContext(UserContext);

  return (
    <header>
      <Link to="/" className="site-logo">
        Book Brain
      </Link>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="library"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          Library
        </NavLink>
        <NavLink
          to="notes"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          Notes
        </NavLink>
        <NavLink
          to={user ? "account" : "login"}
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          {user ? "Settings" : "Login"}
        </NavLink>
      </nav>
    </header>
  );
}
