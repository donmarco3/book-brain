import React from "react";
import { deleteNote, getNote, updateNote } from "../api";
import { useLoaderData, useRevalidator } from "react-router";

export function loader({ params }) {
  return getNote(params.id);
}

export default function Note() {
  const note = useLoaderData();
  const revalidator = useRevalidator();

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(note.noteTitle);
  const [page, setPage] = React.useState(note.page);
  const [context, setContext] = React.useState(note.context);
  const [capture, setCapture] = React.useState(note.capture);
  const [spark, setSpark] = React.useState(note.spark);

  function handleClick() {
    updateNote(note.id, noteTitle, page, context, capture, spark);
    setIsEditing((prev) => !prev);
    revalidator.revalidate();
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(note.id);
      return navigate(`/book/${note.bookId}`);
    }
  }

  return (
    <>
      <h1>Note</h1>
      <div className="card note-content" key={note.id}>
        {!isEditing ? (
          <div>
            <h2>{note.noteTitle}</h2>
            <p>{note.bookTitle}</p>
            <p>{note.page}</p>
            <p>{note.context}</p>
            <p>{note.capture}</p>
            <p>{note.spark}</p>
          </div>
        ) : (
          <div>
            <label htmlFor="note-note-title">Title</label>
            <input
              id="note-note-title"
              defaultValue={note.noteTitle}
              onChange={(e) => setNoteTitle(e.currentTarget.value)}
            />
            <p>{note.bookTitle}</p>
            <label htmlFor="note-page">Page</label>
            <input
              id="note-page"
              defaultValue={note.page}
              onChange={(e) => setPage(e.currentTarget.value)}
            />
            <label htmlFor="note-context">Context</label>
            <textarea
              id="note-context"
              defaultValue={note.context}
              onChange={(e) => setContext(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="note-capture">Capture</label>
            <textarea
              id="note-capture"
              defaultValue={note.capture}
              onChange={(e) => setCapture(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="note-spark">Spark</label>
            <textarea
              id="note-spark"
              defaultValue={note.spark}
              onChange={(e) => setSpark(e.currentTarget.value)}
            ></textarea>
          </div>
        )}
        <button onClick={handleClick}>{isEditing ? "Save" : "Edit"}</button>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        ) : null}
        {!isEditing ? <button onClick={handleDeletion}>Delete</button> : null}
      </div>
    </>
  );
}
