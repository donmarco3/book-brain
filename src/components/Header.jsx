import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Link to="/" className="site-logo">
        BookBrain
      </Link>
      <nav>
        <NavLink to="bookshelf">Bookshelf</NavLink>
        <NavLink to="library">Library</NavLink>
      </nav>
    </header>
  );
}
