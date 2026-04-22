import React from "react";
import {
  addSynthesis,
  deleteBook,
  getBook,
  getSyntheses,
  updateBook,
  updateBookStatus,
  vercelFunction,
} from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { splitOnNewLine } from "../utils";
import Loading from "../components/Loading";

export async function loader({ params }) {
  const book = await getBook(params.id);
  const syntheses = await getSyntheses(params.id);
  return { book, syntheses };
}

export default function Book() {
  const { book, syntheses } = useLoaderData();
  const revalidator = useRevalidator();

  const [isEditing, setIsEditing] = React.useState(false);
  const [bookTitle, setBookTitle] = React.useState(book?.title);
  const [bookAuthor, setBookAuthor] = React.useState(book?.author);
  const [selectedValue, setSelectedValue] = React.useState("standard");
  const [isLoading, setIsLoading] = React.useState(false);
  const [synthesis, setSynthesis] = React.useState();
  const [errorMessage, setErrorMessage] = React.useState();
  const [saveSynthesisMessage, setSaveSynthesisMessage] = React.useState();

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

  async function generateSynthesis() {
    setIsLoading(true);
    vercelFunction(book.cards, selectedValue).then((response) => {
      setSynthesis(response);
      setIsLoading(false);
    });
  }

  async function saveSynthesis() {
    const response = await addSynthesis(book.id, synthesis, selectedValue);
    if (response) {
      setSaveSynthesisMessage("Synthesis already saved");
    } else {
      setSaveSynthesisMessage("Synthesis saved");
    }
    revalidator.revalidate();
  }

  const creationDate = new Date(book.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bookButtons = (
    <div className="note-buttons book-buttons">
      {!isEditing ? (
        <button onClick={() => changeBookStatus(book.id, book.status)}>
          Mark as {book.status === "reading" ? "Finished" : "Reading"}
        </button>
      ) : null}
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
  );

  return (
    <>
      <div className="log-header">
        <Link to={`/bookshelf`} className="link-btn">
          &larr; Back to Bookshelf
        </Link>
        <h1>{book.title}</h1>
      </div>

      {!isEditing ? (
        <div className="card main-card">
          <div className="book-card-header">
            <p className="nice-font card-title">{book.title}</p>
            <p className={book.status === "finished" ? "pill success" : "pill"}>
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
              {book.cards.length} {book.cards.length === 1 ? "Card" : "Cards"}
            </p>
            <Link className="link-btn" to={`/library?book=${book.id}`}>
              View Cards ({book.cards.length})
            </Link>
            {book.cards.length > 0 && (
              <div className="book-synthesis">
                <Link className="link-btn" to={`/syntheses/${book.id}`}>
                  View Syntheses ({syntheses.length})
                </Link>
                <div className="syntheses-buttons">
                  <button
                    className="btn-dark"
                    onClick={generateSynthesis}
                    disabled={isLoading}
                  >
                    {synthesis ? "Regenerate" : "Generate"} Synthesis
                  </button>
                  <select
                    onChange={(e) => setSelectedValue(e.target.value)}
                    defaultValue="standard"
                    disabled={isLoading}
                  >
                    <option value="brief">Brief (1 paragraph)</option>
                    <option value="standard">Standard (3 paragraphs)</option>
                    <option value="in-depth">In-Depth (5 paragraphs)</option>
                  </select>
                </div>
                {isLoading && <Loading />}
                {!isLoading && (
                  <div className="synthesis-generation">
                    {synthesis && (
                      <div>
                        <p className="bold">
                          Here is your personalised synthesis of {book.title}
                        </p>
                        {splitOnNewLine(synthesis).map((section) => (
                          <p key={section}>{section}</p>
                        ))}
                        <button onClick={saveSynthesis}>Save Synthesis</button>
                        {synthesis && (
                          <p
                            className={
                              saveSynthesisMessage === "Synthesis saved"
                                ? "green"
                                : "red"
                            }
                          >
                            {saveSynthesisMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {bookButtons}
        </div>
      ) : (
        <div className="form">
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
          {bookButtons}
        </div>
      )}
    </>
  );
}
