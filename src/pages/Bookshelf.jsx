import React from "react";
import { useLoaderData, useRevalidator, Link } from "react-router-dom";
import { getBooks, deleteBook, updateBookStatus } from "../api";
import AddBook from "../components/AddBook";

export function loader() {
  return getBooks();
}

export default function Bookshelf() {
  const books = useLoaderData();
  const revalidator = useRevalidator();

  function updateBook(id) {
    deleteBook(id);
    revalidator.revalidate();
  }

  function updateBookStatus(id) {
    updateBookStatus(id);
    revalidator.revalidate();
  }

  const bookElements = books.map((book) => {
    return (
      <div className="card" key={book.id}>
        <p>{book.title}</p>
        <p>{book.author}</p>
        <p>{book.status}</p>
        <Link to={`/book/${book.id}/log`}>Log Notes</Link>
        <Link to={`/book/${book.id}/inbox`}>Inbox</Link>
        <button onClick={() => updateBookStatus(book.id)}>{book.status}</button>
        <button onClick={() => updateBook(book.id)}>Delete</button>
      </div>
    );
  });

  return (
    <>
      <h1>Bookshelf</h1>
      <AddBook action={"/bookshelf"} />
      <div className="books-list">{bookElements}</div>
    </>
  );
}
