import React from "react";
import { deleteNote, getNote, updateNote } from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";

export async function loader({ params }) {
  const note = await getNote(params.id);
  if (!note) {
    return { note: null };
  }
  return { note };
}

export default function Note() {
  const { note } = useLoaderData();
  const revalidator = useRevalidator();

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(note?.noteTitle);
  const [page, setPage] = React.useState(note?.page);
  const [context, setContext] = React.useState(note?.context);
  const [capture, setCapture] = React.useState(note?.capture);
  const [spark, setSpark] = React.useState(note?.spark);

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
    updateNote(note.id, noteTitle, page, context, capture, spark);
    setIsEditing((prev) => !prev);
    revalidator.revalidate();
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(note.id);
      return navigate(`/book/${note.bookId}/inbox`);
    }
  }

  return (
    <>
      <div className="log-header">
        <Link to={`/book/${note.bookId}/inbox`} className="link-btn">
          &larr; Back to Inbox
        </Link>
        <h1>{note.noteTitle}</h1>
      </div>

      <div className="card main-card" key={note.id}>
        {!isEditing ? (
          <>
            <div className="main-card-header">
              <p className="nice-font card-title">{note.noteTitle}</p>
              <div>
                <p>{note.bookTitle}</p>
                <p>p. {note.page}</p>
              </div>
            </div>

            <div className="main-card-text">
              <p>
                <span>Context:</span> {note.context.slice(0, 300)}
              </p>
              <p className="italic capture">{note.capture.slice(0, 300)}</p>
              <div className="pill">
                <p>{note.spark.slice(0, 300)}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="note-editing">
            <p>
              <span className="bold">Book:</span>{" "}
              <span className="nice-font">{note.bookTitle}</span>
            </p>
            <div className="note-editing-header">
              <div>
                <label htmlFor="note-note-title">
                  Note Title <span className="required-field">*</span>
                </label>
                <input
                  id="note-note-title"
                  defaultValue={note.noteTitle}
                  onChange={(e) => setNoteTitle(e.currentTarget.value)}
                />
              </div>
              <div>
                <label htmlFor="note-page">
                  Page <span className="required-field">*</span>
                </label>
                <input
                  id="note-page"
                  defaultValue={note.page}
                  onChange={(e) => setPage(e.currentTarget.value)}
                />
              </div>
            </div>
            <label htmlFor="note-context">
              Context <span className="required-field">*</span>
            </label>
            <textarea
              id="note-context"
              defaultValue={note.context}
              onChange={(e) => setContext(e.currentTarget.value)}
              rows={3}
            ></textarea>
            <label htmlFor="note-capture">
              Capture (passage from the book){" "}
              <span className="required-field">*</span>
            </label>
            <textarea
              id="note-capture"
              defaultValue={note.capture}
              onChange={(e) => setCapture(e.currentTarget.value)}
              rows={3}
            ></textarea>
            <label htmlFor="note-spark">
              Spark (your thought/reaction){" "}
              <span className="required-field">*</span>
            </label>
            <textarea
              id="note-spark"
              defaultValue={note.spark}
              onChange={(e) => setSpark(e.currentTarget.value)}
              rows={3}
            ></textarea>
          </div>
        )}
        <div className="note-buttons">
          <button onClick={handleClick} className="btn-dark btn-lg">
            {isEditing ? "Save" : "Edit"}
          </button>
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="btn-lg">
              Cancel
            </button>
          ) : null}
          {!isEditing ? (
            <button onClick={handleDeletion} className="btn-delete btn-lg">
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
