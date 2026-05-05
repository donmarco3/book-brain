import React from "react";
import { Link, Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import Avatar from "./Avatar";

export default function Layout() {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setWindowWidth(window.innerWidth),
      );
  });

  return (
    <>
      {windowWidth >= 750 ? (
        <div className="wrapper flex-row">
          <Navigation size="large" />
          <main>
            <Outlet />
          </main>
        </div>
      ) : (
        <div className="wrapper flex-col">
          <div className="header flex-row space-between align-center padding-inline">
            <Link to="/" className="site-logo">
              Book Brain
            </Link>
            <Link to="/account">
              <Avatar name="Marco" size="sm" />
            </Link>
          </div>
          <main>
            <Outlet />
          </main>
          <Navigation size="small" />
        </div>
      )}
    </>
  );
}
