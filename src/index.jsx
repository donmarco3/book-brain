import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home, { loader as homeLoader } from "./components/Home";
import Layout from "./components/Layout";
import AddBook, { action as addBookAction } from "./components/AddBook";
import Error from "./components/Error";
import Bookshelf, { loader as bookshelfLoader } from "./pages/Bookshelf";
import Log, { loader as logLoader, action as logAction } from "./pages/Log";
import Library, { loader as libraryLoader } from "./pages/Library";
import Inbox, { loader as inboxLoader } from "./pages/Inbox";
import Distillation, {
  loader as distillationLoader,
} from "./pages/Distillation";
import NotFound from "./pages/NotFound";
import Card, { loader as cardLoader } from "./pages/Card";
import Note, { loader as noteLoader } from "./pages/Note";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route
        index
        element={<Home />}
        loader={homeLoader}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="bookshelf"
        element={<Bookshelf />}
        loader={bookshelfLoader}
        action={addBookAction}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="library"
        element={<Library />}
        loader={libraryLoader}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="card/:id"
        element={<Card />}
        loader={cardLoader}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="book/:id/log"
        element={<Log />}
        loader={logLoader}
        action={logAction}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="book/:id/inbox"
        element={<Inbox />}
        loader={inboxLoader}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="note/:id"
        element={<Note />}
        loader={noteLoader}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route
        path="book/:id/distillation"
        element={<Distillation />}
        loader={distillationLoader}
        errorElement={<Error />}
        hydrateFallbackElement={<h1>Loading...</h1>}
      />
      <Route element={<AddBook />} action={addBookAction} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
