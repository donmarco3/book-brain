import React from "react";
import { useLoaderData, useRevalidator, Link } from "react-router";
import { getNotes, deleteNote, getBook } from "../api";

export async function loader({ params }) {
  const notes = await getNotes(params.id);
  const book = await getBook(params.id);
  return { notes, book };
}

export default function Inbox() {
  const { notes, book } = useLoaderData();
  const revalidator = useRevalidator();

  function updateNote(id) {
    deleteNote(id);
    revalidator.revalidate();
  }

  const noteElements = notes.map((note) => {
    return (
      <div className="card" key={note.id}>
        <p>{note.title}</p>
        <p>{note.capture}</p>
        <p>{note.spark}</p>
        <button onClick={() => updateNote(note.id)}>Delete</button>
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
