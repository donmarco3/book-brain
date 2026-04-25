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
import Library, { loader as libraryLoader } from "./pages/Library";
import Log, { loader as logLoader, action as logAction } from "./pages/Log";
import Notes, { loader as notesLoader } from "./pages/Notes";
import NotFound from "./pages/NotFound";
import Note, { loader as noteLoader } from "./pages/Note";
import ManageBuckets, {
  loader as manageBucketsLoader,
} from "./pages/ManageBuckets";
import Login, { action as loginAction } from "./pages/Login";
import { getCurrentUser } from "./api";
import Register, { action as registerAction } from "./pages/Register";
import UpdatePassword, {
  action as updatePasswordAction,
} from "./pages/UpdatePassword";
import Account, { loader as accountLoader } from "./pages/Account";
import AuthRequired from "./components/AuthRequired";
import Book, { loader as bookLoader } from "./pages/Book";
import Syntheses, { loader as synthesesLoader } from "./pages/Syntheses";
import Synthesis, { loader as synthesisLoader } from "./pages/Synthesis";
import Loading from "./components/Loading";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/login" element={<Login />} action={loginAction} />
      <Route path="/register" element={<Register />} action={registerAction} />
      <Route
        path="/update-password"
        element={<UpdatePassword />}
        action={updatePasswordAction}
      />
      <Route element={<AuthRequired />}>
        <Route
          index
          element={<Home />}
          loader={homeLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<Loading text="Loading home..." />}
        />
        <Route
          path="/account"
          element={<Account />}
          loader={accountLoader}
          hydrateFallbackElement={<Loading text="Loading home..." />}
        />
        <Route
          path="library"
          element={<Library />}
          loader={libraryLoader}
          action={addBookAction}
          errorElement={<Error />}
          hydrateFallbackElement={<Loading text="Loading library..." />}
        />
        <Route element={<AddBook />} action={addBookAction} />
        <Route
          path="book/:id"
          element={<Book />}
          loader={bookLoader}
          hydrateFallbackElement={<Loading text="Loading book..." />}
        />
        <Route
          path="notes"
          element={<Notes />}
          loader={notesLoader}
          hydrateFallbackElement={<Loading text="Loading notes..." />}
        />
        <Route
          path="manage-buckets"
          element={<ManageBuckets />}
          loader={manageBucketsLoader}
          hydrateFallbackElement={<Loading text="Loading buckets..." />}
        />
        <Route
          path="book/:id/log"
          element={<Log />}
          loader={logLoader}
          action={logAction}
          errorElement={<Error />}
          hydrateFallbackElement={<Loading text="Loading book..." />}
        />
        <Route
          path="note/:id"
          element={<Note />}
          loader={noteLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<Loading text="Loading note..." />}
        />
        <Route
          path="syntheses/:id"
          element={<Syntheses />}
          loader={synthesesLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<Loading text="Loading syntheses..." />}
        />
        <Route
          path="synthesis/:id"
          element={<Synthesis />}
          loader={synthesisLoader}
          errorElement={<Error />}
          hydrateFallbackElement={<Loading text="Loading synthesis..." />}
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

const UserContext = React.createContext();

function App() {
  const [user, setUser] = React.useState();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    getCurrentUser().then((data) => {
      if (!data) {
        setUser(undefined);
      } else {
        setUser(data.data.user);
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
