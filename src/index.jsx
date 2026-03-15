import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import Layout from "./components/Layout";

const router = createBrowserRouter(
  createRoutesFromElements(<Route path="/" element={<Layout />} />),
);

function App() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
