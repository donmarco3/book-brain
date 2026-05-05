import React from "react";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "..";
import { FaBookOpen, FaThLarge, FaPenNib, FaCog } from "react-icons/fa";

export default function Navigation({ size }) {
  const { user } = React.useContext(UserContext);

  return (
    <header className={size === "large" ? "sidebar-nav" : "bottom-nav"}>
      {size === "large" && (
        <div>
          <Link to="/" className="site-logo">
            Book Brain
          </Link>
        </div>
      )}
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          <div className="icon-pill">
            <FaThLarge />
            Dashboard
          </div>
        </NavLink>
        <NavLink
          to="library"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          <div className="icon-pill">
            <FaBookOpen />
            Library
          </div>
        </NavLink>
        <NavLink
          to="notes"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          <div className="icon-pill">
            <FaPenNib />
            Notes
          </div>
        </NavLink>
        <NavLink
          to={user ? "account" : "login"}
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          <div className="icon-pill">
            <FaCog />
            {user ? "Account" : "Login"}
          </div>
        </NavLink>
      </nav>
    </header>
  );
}
