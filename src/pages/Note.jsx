import React from "react";
import { deleteNote, getBook, getNote, updateNote } from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { validatePageRange } from "../utils";

export async function loader({ params }) {
  const note = await getNote(params.id);
  if (!note) {
    return { note: null };
  }
  const book = await getBook(note.book_id);
  return { note, book };
}

export default function Note() {
  const { note, book } = useLoaderData();
  const revalidator = useRevalidator();

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(note?.note_title);
  const [page, setPage] = React.useState(note?.page);
  const [context, setContext] = React.useState(note?.context);
  const [capture, setCapture] = React.useState(note?.capture);
  const [spark, setSpark] = React.useState(note?.spark);
  const [errorMessage, setErrorMessage] = React.useState("");

  if (!note) {
    return (
      <>
        <h1>Note not found.</h1>
        <Link to="/bookshelf" className="link-btn link-btn-dark">
          Back to Bookshelf
        </Link>
      </>
    );
  }

  function handleClick() {
    if (!noteTitle) {
      setErrorMessage("Title is required");
      return;
    }
    if (!page) {
      setErrorMessage("Page is required");
      return;
    }
    if (!context && !capture && !spark) {
      setErrorMessage("At least one of context, capture, or spark is required");
      return;
    }

    try {
      validatePageRange(page);
      updateNote(note.id, noteTitle, page, context, capture, spark);
      setIsEditing((prev) => !prev);
      revalidator.revalidate();
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(note.id);
      return navigate(`/book/${note.book_id}/inbox`);
    }
  }

  const noteButtons = (
    <div className="note-buttons">
      <button onClick={handleClick} className="btn-dark">
        {isEditing ? "Save" : "Edit"}
      </button>
      {isEditing ? (
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      ) : null}
      {!isEditing ? (
        <button onClick={handleDeletion} className="btn-delete">
          Delete
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="log-header">
        <Link to={`/book/${note.book_id}/inbox`} className="link-btn">
          &larr; Back to Inbox
        </Link>
        <h1>{note.note_title}</h1>
      </div>

      {!isEditing ? (
        <div className="card main-card">
          <div className="main-card-header">
            <p className="nice-font card-title">{note.note_title}</p>
            <div>
              <p>{book.title}</p>
              <p>p. {note.page}</p>
            </div>
          </div>

          <div className="main-card-text">
            {note.context && (
              <p>
                <span className="bold">Context:</span> {note.context}
              </p>
            )}
            {note.capture && (
              <p className="italic capture">{note.capture.slice(0, 300)}</p>
            )}
            <div className="pill">
              <p>{note.spark.slice(0, 300)}</p>
            </div>
          </div>
          {noteButtons}
        </div>
      ) : (
        <div className="form">
          <p>
            <span className="bold">Book:</span>{" "}
            <span className="nice-font">{book.title}</span>
          </p>
          {errorMessage && <p className="red">{errorMessage}</p>}
          <div className="form-header">
            <div>
              <label htmlFor="note-note-title" className="bold">
                Note Title <span className="required-field">*</span>
              </label>
              <input
                id="note-note-title"
                defaultValue={note.note_title}
                onChange={(e) => setNoteTitle(e.currentTarget.value)}
              />
            </div>
            <div>
              <label htmlFor="note-page" className="bold">
                Page <span className="required-field">*</span>
              </label>
              <input
                id="note-page"
                defaultValue={note.page}
                onChange={(e) => setPage(e.currentTarget.value)}
              />
            </div>
          </div>
          <label htmlFor="note-context" className="bold">
            Context
          </label>
          <textarea
            id="note-context"
            defaultValue={note.context}
            onChange={(e) => setContext(e.currentTarget.value)}
            rows={3}
          ></textarea>
          <label htmlFor="note-capture" className="bold">
            Capture (passage from the book){" "}
          </label>
          <textarea
            id="note-capture"
            defaultValue={note.capture}
            onChange={(e) => setCapture(e.currentTarget.value)}
            rows={3}
          ></textarea>
          <label htmlFor="note-spark" className="bold">
            Spark (your thought/reaction){" "}
          </label>
          <textarea
            id="note-spark"
            defaultValue={note.spark}
            onChange={(e) => setSpark(e.currentTarget.value)}
            rows={3}
          ></textarea>
          {noteButtons}
        </div>
      )}
    </>
  );
}
