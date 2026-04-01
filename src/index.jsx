import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import Home, { loader as homeLoader } from "./pages/Home";
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
import ManageBuckets, {
  loader as manageBucketsLoader,
} from "./pages/ManageBuckets";
import Login, { action as loginAction } from "./pages/Login";
import { monitorAuthState } from "./api";
import Register, { action as registerAction } from "./pages/Register";
import Account from "./pages/Account";
import AuthRequired from "./components/AuthRequired";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/login" element={<Login />} action={loginAction} />
      <Route path="/register" element={<Register />} action={registerAction} />
      <Route element={<AuthRequired />}>
        <Route
          index
          element={<Home />}
          loader={homeLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Home...</h1>}
        />
        <Route path="/account" element={<Account />} />
        <Route
          path="bookshelf"
          element={<Bookshelf />}
          loader={bookshelfLoader}
          action={addBookAction}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Bookshelf...</h1>}
        />
        <Route
          path="library"
          element={<Library />}
          loader={libraryLoader}
          hydrateFallbackElement={<h1>Loading Library...</h1>}
        />
        <Route
          path="manage-buckets"
          element={<ManageBuckets />}
          loader={manageBucketsLoader}
          hydrateFallbackElement={<h1>Loading Buckets...</h1>}
        />
        <Route
          path="card/:id"
          element={<Card />}
          loader={cardLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Card...</h1>}
        />
        <Route
          path="book/:id/log"
          element={<Log />}
          loader={logLoader}
          action={logAction}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Log...</h1>}
        />
        <Route
          path="book/:id/inbox"
          element={<Inbox />}
          loader={inboxLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Inbox...</h1>}
        />
        <Route
          path="note/:id"
          element={<Note />}
          loader={noteLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Note...</h1>}
        />
        <Route
          path="book/:id/distillation"
          element={<Distillation />}
          loader={distillationLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<h1>Loading Distillation...</h1>}
        />
        <Route element={<AddBook />} action={addBookAction} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

const UserContext = React.createContext();

function App() {
  const [user, setUser] = React.useState();
  const [isLoading, setIsLoading] = React.useState(true);
  console.log(user);

  React.useEffect(() => {
    setIsLoading(true);
    monitorAuthState((user) => {
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export { UserContext };
