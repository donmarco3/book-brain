import React from "react";
import {
  deleteBook,
  getBook,
  getBookCards,
  updateBook,
  updateBookStatus,
} from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";

export async function loader({ params }) {
  const book = await getBook(params.id);
  const cards = await getBookCards(params.id);
  return { book, cards };
}

export default function Book() {
  const { book, cards } = useLoaderData();
  const revalidator = useRevalidator();

  const [isEditing, setIsEditing] = React.useState(false);
  const [bookTitle, setBookTitle] = React.useState(book?.title);
  const [bookAuthor, setBookAuthor] = React.useState(book?.author);
  const [errorMessage, setErrorMessage] = React.useState();

  function handleClick() {
    if (!bookTitle) {
      setErrorMessage("Book title is required");
      return;
    }
    if (!bookAuthor) {
      setErrorMessage("Author is required");
      return;
    }

    try {
      updateBook(book.id, bookTitle, bookAuthor);
      setIsEditing((prev) => !prev);
      revalidator.revalidate();
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }
  }

  function changeBookStatus(id, currentStatus) {
    updateBookStatus(id, currentStatus).then(() => revalidator.revalidate());
  }

  function handleDeletion() {
    if (
      window.confirm(
        "Are you sure you want to delete this book? Deleting this book will also delete any associated notes and cards. Do you wish to continue?",
      )
    ) {
      deleteBook(book.id);
      return navigate("/bookshelf");
    }
  }

  const creationDate = new Date(book.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="log-header">
        <Link to={`/bookshelf`} className="link-btn">
          &larr; Back to Bookshelf
        </Link>
        <h1>{book.title}</h1>
      </div>

      <div className="card main-card">
        {!isEditing ? (
          <>
            <div className="book-card-header">
              <p className="nice-font card-title">{book.title}</p>
              <p
                className={book.status === "finished" ? "pill success" : "pill"}
              >
                {book.status === "finished" ? "Finished" : "Reading"}
              </p>
            </div>
            <p className="text-sm">by {book.author}</p>
            <div className="book-info">
              <p className="text-sm">
                <span className="bold">Date added: </span>
                {creationDate}
              </p>
              <p className="text-sm">
                {cards} {cards.length === 1 ? "Card" : "Cards"}
              </p>
              <Link className="link-btn" to={`/library?book=${book.id}`}>
                View Cards
              </Link>
            </div>
          </>
        ) : (
          <div className="note-editing">
            {errorMessage && <p className="red">{errorMessage}</p>}
            <div>
              <label htmlFor="card-book-title" className="bold">
                Book Title <span className="required-field">*</span>
              </label>
              <input
                id="card-book-title"
                defaultValue={book.title}
                onChange={(e) => setBookTitle(e.currentTarget.value)}
              />
            </div>
            <div>
              <label htmlFor="card-author" className="bold">
                Author <span className="required-field">*</span>
              </label>
              <input
                id="card-author"
                defaultValue={book.author}
                onChange={(e) => setBookAuthor(e.currentTarget.value)}
              />
            </div>
          </div>
        )}
        <div className="note-buttons book-buttons">
          <button onClick={() => changeBookStatus(book.id, book.status)}>
            Mark as {book.status === "reading" ? "Finished" : "Reading"}
          </button>
          <div>
            <button className="btn-dark" onClick={handleClick}>
              {isEditing ? "Save" : "Edit"}
            </button>
            {isEditing ? (
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            ) : null}
            {!isEditing ? (
              <button className="btn-delete" onClick={handleDeletion}>
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
