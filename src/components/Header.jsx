import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Link to="/" className="site-logo">
        BookBrain
      </Link>
      <nav>
        <NavLink
          to="bookshelf"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          Bookshelf
        </NavLink>
        <NavLink
          to="library"
          className={({ isActive }) => (isActive ? "active" : null)}
        >
          Library
        </NavLink>
      </nav>
    </header>
  );
}
