import React from "react";
import { UserContext } from "..";
import { Navigate, Outlet } from "react-router";

export default function AuthRequired() {
  const { user } = React.useContext(UserContext);

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
