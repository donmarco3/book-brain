import React from "react";
import {
  addSynthesis,
  deleteBook,
  getBook,
  updateBook,
  updateBookStatus,
  vercelFunction,
} from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { calculateProgress, splitOnNewLine } from "../utils";
import Loading from "../components/Loading";
import { FaAngleRight, FaPenNib } from "react-icons/fa";
import ProgressBar from "../components/ProgressBar";

export async function loader({ params }) {
  const book = await getBook(params.id);
  return { book };
}

export default function Book() {
  const { book } = useLoaderData();
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
        "Are you sure you want to delete this book? Deleting this book will also delete any associated notes. Do you wish to continue?",
      )
    ) {
      deleteBook(book.id);
      return navigate("/library");
    }
  }

  async function generateSynthesis() {
    setIsLoading(true);
    vercelFunction(book.notes, selectedValue).then((response) => {
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
    <div className="margin-inline">
      <div className="page-heading flex-row">
        <Link to={`/library`} className="link-btn margin-block">
          &larr; Back to Library
        </Link>
        <FaAngleRight />
        <p className="italic">{book.title}</p>
      </div>

      {!isEditing ? (
        <>
          <div className="flex-row margin-block">
            <div className="book-image"></div>

            <div className="padding-inline book-info">
              <p className="gold">
                {book.status === "read" ? "Read" : "Reading"}
              </p>
              <h3>{book.title}</h3>
              <p className="italic">{book.author}</p>
              <div className="flex-row margin-block">
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={() => changeBookStatus(book.id, book.status)}>
                  Mark as {book.status === "reading" ? "read" : "reading"}
                </button>
                <button>Update progress</button>
              </div>
              <div className="flex-col progress">
                <p>Progress</p>
                <ProgressBar
                  progress={calculateProgress(book.progress, book.pages)}
                />
                <p>
                  {calculateProgress(book.progress, book.pages)}% &middot; p.{" "}
                  {book.progress} of {book.pages}
                </p>
              </div>
            </div>
          </div>

          <div className="border margin-block"></div>

          <div className="margin-block">
            <h3>Notes</h3>
            <div className="card flex-row space-between">
              <div>
                <p className="number">{book.notes.length}</p>
                <p>notes logged for this book</p>
              </div>
              <div className="icon-pill">
                <Link to={`/notes?book=${book.id}`} className="link">
                  View all notes <FaAngleRight />
                </Link>
              </div>
            </div>
          </div>

          <div className="border margin-block"></div>

          <div className="card card-red margin-block">
            <div className="flex-row space-between">
              <h3 className="gold">Your Synthesis</h3>
              <div className="flex-row">
                {book.notes.length > 0 && (
                  <select
                    onChange={(e) => setSelectedValue(e.target.value)}
                    defaultValue="standard"
                    disabled={isLoading}
                  >
                    <option value="brief">Brief (1 paragraph)</option>
                    <option value="standard">Standard (3 paragraphs)</option>
                    <option value="in-depth">In-Depth (5 paragraphs)</option>
                  </select>
                )}
                <button
                  onClick={generateSynthesis}
                  disabled={isLoading || book.notes.length === 0}
                >
                  {synthesis ? "Regenerate" : "Generate"} Synthesis
                </button>
              </div>
            </div>
            {isLoading && <Loading text="Generating synthesis..." />}
            {!isLoading && (
              <div className="synthesis-generation">
                {book.notes.length > 0
                  ? "No synthesis generated yet. Hit Generate to create a personalised summary based on your notes for this book."
                  : "Add notes for this book to generate a synthesis."}
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

          <div className="book-info">
            {book.notes.length > 0 && (
              <div className="book-synthesis">
                <Link
                  className="link-btn"
                  to={`/syntheses/${book.id}?page=1&sort=newest`}
                >
                  View Syntheses ({book.syntheses.length})
                </Link>
              </div>
            )}
          </div>
        </>
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
    </div>
  );
}
