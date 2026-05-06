import React from "react";
import { Link, Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import Avatar from "./Avatar";
import { UserContext } from "..";

export const SizeContext = React.createContext();

export default function Layout() {
  const { user, isLoading } = React.useContext(UserContext);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setWindowWidth(window.innerWidth),
      );
  });

  let size;
  if (windowWidth >= 750) {
    size = "large";
  } else {
    size = "small";
  }

  return (
    <SizeContext.Provider value={size}>
      {size === "large" ? (
        <div className="wrapper flex-row">
          <Navigation size="large" />
          <main>
            <Outlet context={size} />
          </main>
        </div>
      ) : (
        <div className="wrapper flex-col">
          <div className="header">
            <Link to="/" className="site-logo">
              Book Brain
            </Link>
            {user && (
              <Link to="/account">
                <Avatar name="Marco" size="sm" />
              </Link>
            )}
          </div>
          <main>
            <Outlet context={size} />
          </main>
          <Navigation size="small" />
        </div>
      )}
    </SizeContext.Provider>
  );
}
