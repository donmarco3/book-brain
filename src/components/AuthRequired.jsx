import React from "react";
import { UserContext } from "..";
import { Navigate, Outlet } from "react-router";
import Loading from "./Loading";

export default function AuthRequired() {
  const { user, isLoading } = React.useContext(UserContext);

  if (isLoading) {
    return <Loading />;
  } else if (user && !isLoading) {
    return <Outlet />;
  } else if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }
}
