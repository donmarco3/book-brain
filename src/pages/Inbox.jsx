import React from "react";
import { useLoaderData, Link } from "react-router";
import { getNotes, getBook } from "../api";
import { sliceString } from "../utils";

export async function loader({ params }) {
  const notes = await getNotes(params.id);
  const book = await getBook(params.id);
  return { notes, book };
}

export default function Inbox() {
  const { notes, book } = useLoaderData();

  const noteElements = notes.map((note) => {
    return (
      <div className="card main-card" key={note.id}>
        <Link to={`/note/${note.id}`} className="link">
          <div className="main-card-header">
            <p className="nice-font card-title">{note.noteTitle}</p>
            <div>
              <p>p. {note.page}</p>
            </div>
          </div>

          <div className="main-card-text">
            <p>
              <span className="bold">Context:</span> {sliceString(note.context)}
            </p>
            <p className="italic capture">{sliceString(note.capture)}</p>
            <div className="pill">
              <p>{sliceString(note.spark)}</p>
            </div>
          </div>
        </Link>
      </div>
    );
  });

  return (
    <>
      <div className="log-header">
        <Link to="/bookshelf" className="link-btn">
          &larr; Back to Bookshelf
        </Link>
        <h1>Inbox</h1>
        <p>
          {book.title} by {book.author}
        </p>
      </div>

      <div className="inbox-sub-header">
        <p className="text-sm">
          {notes.length > 0
            ? `${notes.length} notes ready for review`
            : "You have no notes to review"}
        </p>
        <div>
          <Link
            to={`/book/${book.id}/log`}
            state={{ from: `/book/${book.id}/inbox` }}
            className="link-btn"
          >
            New Note
          </Link>
          {notes.length > 0 && (
            <Link
              to={`/book/${book.id}/distillation`}
              className="link-btn link-btn-dark"
            >
              Begin Distillation
            </Link>
          )}
        </div>
      </div>

      <div className="notes-list">{noteElements}</div>
    </>
  );
}
