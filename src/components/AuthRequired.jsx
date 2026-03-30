import React from "react";
import { UserContext } from "..";
import { Navigate, Outlet } from "react-router";

export default function AuthRequired() {
  const { user, isLoading } = React.useContext(UserContext);

  if (isLoading) {
    return <h1>Loading user credentials...</h1>;
  } else if (user && !isLoading) {
    return <Outlet />;
  } else if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }
}
