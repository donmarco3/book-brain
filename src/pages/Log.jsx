import React from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useLocation,
} from "react-router";
import { addNote, getBook } from "../api";
import { validatePageRange } from "../utils";

export function loader({ params }) {
  return getBook(params.id);
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const book = await getBook(params.id);
  const title = formData.get("note-title");
  const page = formData.get("book-page");
  const context = formData.get("note-context");
  const capture = formData.get("note-capture");
  const spark = formData.get("note-spark");
  if (!title) {
    return { error: "Title is required" };
  }
  if (!page) {
    return { error: "Page is required" };
  }
  if (!context && !capture && !spark) {
    return { error: "At least one of context, capture, or spark is required" };
  }

  try {
    await validatePageRange(page);
    addNote({ title, page, context, capture, spark }, book);
    return redirect(`/book/${book.id}/inbox`);
  } catch (error) {
    return { error: error.message };
  }
}

export default function Log() {
  const book = useLoaderData();
  const actionData = useActionData();
  const location = useLocation();

  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    }
  }, [actionData]);

  const pathName = location.state ? location.state.from : "/bookshelf";

  let pathNameText;
  if (pathName === "/") {
    pathNameText = "Home";
  } else if (pathName === "/bookshelf") {
    pathNameText = "Bookshelf";
  } else {
    pathNameText = "Inbox";
  }

  return (
    <>
      <div className="log-header">
        <Link to={pathName} className="link-btn">
          &larr; Back to {pathNameText}
        </Link>
        <h1>Log Notes</h1>
        <p>
          {book.title} by {book.author}
        </p>
      </div>

      <Form method="post" className="log-note-form" replace>
        <h2>New Note</h2>
        {errorMessage && <p className="red error">{errorMessage}</p>}
        <div className="log-note-form-header">
          <div>
            <label htmlFor="note-title">
              Title <span className="required-field">*</span>
            </label>
            <input id="note-title" name="note-title" placeholder="Note title" />
          </div>
          <div>
            <label htmlFor="book-page">
              Page <span className="required-field">*</span>
            </label>
            <input
              id="book-page"
              name="book-page"
              placeholder="e.g. 42 or 7-12 or 7-12, 23-45"
            />
          </div>
        </div>
        <label htmlFor="note-context">Context</label>
        <textarea
          id="note-context"
          name="note-context"
          placeholder="Summarise the key idea in your own words..."
          rows={3}
        ></textarea>
        <label htmlFor="note-capture">Capture (passage from the book) </label>
        <textarea
          id="note-capture"
          name="note-capture"
          placeholder="Copy a quote or passage from the book..."
          rows={3}
        ></textarea>
        <label htmlFor="note-spark">Spark (your thought/reaction) </label>
        <textarea
          id="note-spark"
          name="note-spark"
          placeholder="What does this make you think? Any connections or reactions?"
          rows={3}
        ></textarea>
        <div className="log-note-buttons">
          <button className="btn-dark btn-lg">Save Note</button>
        </div>
      </Form>
    </>
  );
}
