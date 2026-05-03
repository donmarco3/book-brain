import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";

export default function Layout() {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [showNav, setShowNav] = React.useState(true);

  return (
    <div className="wrapper">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
