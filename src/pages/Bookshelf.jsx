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

  function handleDeletion(id) {
    if (
      window.confirm(
        "Are you sure you want to delete this book? Deleting this book will also delete any associated notes and cards. Do you wish to continue?",
      )
    ) {
      deleteBook(id).then(() => revalidator.revalidate());
    }
  }

  function changeBookStatus(id, currentStatus) {
    updateBookStatus(id, currentStatus).then(() => revalidator.revalidate());
  }

  const bookElements = books.map((book) => {
    return (
      <div className="card book-card" key={book.id}>
        <div className="book-card-header">
          <p className="nice-font card-title">{book.title}</p>
          <p className={book.status === "finished" ? "pill success" : "pill"}>
            {book.status === "finished" ? "Finished" : "Reading"}
          </p>
        </div>
        <p className="text-sm">by {book.author}</p>
        <div className="book-card-links">
          <Link
            className="link-btn link-btn-dark"
            to={`/book/${book.id}/log`}
            state={{ from: "/bookshelf" }}
          >
            Log Notes
          </Link>
          <Link className="link-btn" to={`/book/${book.id}/inbox`}>
            Inbox
          </Link>
          <Link className="link-btn" to={`/library?book=${book.id}`}>
            View Cards
          </Link>
        </div>
        <div className="note-buttons book-buttons">
          <button onClick={() => changeBookStatus(book.id, book.status)}>
            Mark as {book.status === "reading" ? "Finished" : "Reading"}
          </button>
          <div>
            <Link
              to={`/book/${book.id}`}
              state={{ from: "/bookshelf" }}
              className="link link-btn"
            >
              Edit Book
            </Link>
            <button
              className="btn-delete"
              onClick={() => handleDeletion(book.id)}
            >
              Delete Book
            </button>
          </div>
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
        <button className="btn-dark" onClick={() => setShowModal(true)}>
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
