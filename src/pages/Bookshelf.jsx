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

  const [showModal, setShowModal] = React.useState(false);

  function updateBook(id) {
    deleteBook(id);
    revalidator.revalidate();
  }

  function changeBookStatus(id, currentStatus) {
    updateBookStatus(id, currentStatus);
    revalidator.revalidate();
  }

  const bookElements = books.map((book) => {
    return (
      <div className="card" key={book.id}>
        <div className="book-card-header">
          <p className="nice-font card-title">{book.title}</p>
          <p className={book.status === "Finished" ? "pill success" : "pill"}>
            {book.status}
          </p>
        </div>
        <p className="text-sm">by {book.author}</p>
        <div className="book-card-links">
          <Link className="link-btn link-btn-dark" to={`/book/${book.id}/log`}>
            Log Notes
          </Link>
          <Link className="link-btn" to={`/book/${book.id}/inbox`}>
            Inbox
          </Link>
          <Link className="link-btn" to={`/book/${book.id}/cards`}>
            View Cards
          </Link>
        </div>
        <div className="book-card-buttons">
          <button onClick={() => changeBookStatus(book.id, book.status)}>
            Mark as {book.status === "Reading" ? "Finished" : "Reading"}
          </button>
          <button className="btn-delete" onClick={() => updateBook(book.id)}>
            Delete
          </button>
        </div>
      </div>
    );
  });

  return (
    <>
      <h1>Bookshelf</h1>
      <div className="bookshelf-header">
        <p className="text-sm">
          {books.length} {books.length === 1 ? "book" : "books"}
        </p>
        <button className="btn-dark btn-lg" onClick={() => setShowModal(true)}>
          + Add Book
        </button>
      </div>
      <AddBook
        action={"/bookshelf"}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      {books.length > 0 ? (
        <div className="books-list">{bookElements}</div>
      ) : (
        <p>You have no books. Click add book to add your first.</p>
      )}
    </>
  );
}
