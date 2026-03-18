import React from "react";
import { useLoaderData, Link } from "react-router";
import { getNotes, getBook } from "../api";

export async function loader({ params }) {
  const notes = await getNotes(params.id);
  const book = await getBook(params.id);
  return { notes, book };
}

export default function Inbox() {
  const { notes, book } = useLoaderData();

  const noteElements = notes.map((note) => {
    return (
      <div className="card" key={note.id}>
        <Link to={`/note/${note.id}`}>
          <p>{note.noteTitle}</p>
          <p>{note.bookTitle}</p>
          {note.spark ? (
            <p>{note.spark.slice(0, 300)}</p>
          ) : (
            <p>{note.capture.slice(0, 300)}</p>
          )}
        </Link>
      </div>
    );
  });

  return (
    <>
      <Link to="/bookshelf">&larr; Back to bookshelf</Link>
      <h1>Inbox</h1>
      <p>
        {book.title} by {book.author}
      </p>
      <Link to={`/book/${book.id}/log`}>New Note</Link>
      <Link to={`/book/${book.id}/distillation`}>Begin Distillation</Link>
      <div className="notes-list">{noteElements}</div>
    </>
  );
}
