import React from "react";
import {
  addSynthesis,
  deleteBook,
  getBook,
  openAiFunction,
  updateBook,
  updateBookStatus,
} from "../api";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router";
import { calculateProgress, sliceString, splitOnNewLine } from "../utils";
import Loading from "../components/Loading";
import { FaCog } from "react-icons/fa";
import ProgressBar from "../components/ProgressBar";
import Pill from "../components/Pill";
import UpdateProgress from "../components/UpdateProgress";
import BookCover from "../components/BookCover";

export async function loader({ params }) {
  const book = await getBook(params.id);
  return { book };
}

export default function Book() {
  const { book } = useLoaderData();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = React.useState(false);
  const [bookTitle, setBookTitle] = React.useState(book?.title);
  const [bookAuthor, setBookAuthor] = React.useState(book?.author);
  const [bookPages, setBookPages] = React.useState(book?.pages);
  const [bookProgress, setBookProgress] = React.useState(book?.progress);
  const [selectedValue, setSelectedValue] = React.useState("Standard");
  const [isLoading, setIsLoading] = React.useState(false);
  const [synthesis, setSynthesis] = React.useState();
  const [errorMessage, setErrorMessage] = React.useState();
  const [saveSynthesisMessage, setSaveSynthesisMessage] = React.useState();
  const [showModal, setShowModal] = React.useState(false);

  function handleClick() {
    if (!bookTitle) {
      setErrorMessage("Book title is required");
      return;
    }
    if (!bookAuthor) {
      setErrorMessage("Author is required");
      return;
    }
    if (!bookPages) {
      setErrorMessage("Number of pages is required");
      return;
    }
    if (!bookProgress) {
      setBookProgress(0);
    }

    try {
      updateBook(book.id, bookTitle, bookAuthor, bookPages, bookProgress).then(
        () => revalidator.revalidate(),
      );
      setIsEditing((prev) => !prev);
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }
  }

  function changeBookStatus() {
    let progress;
    updateBookStatus(book.id, book.status).then(() => {
      if (book.status === "read") {
        progress = book.pages;
      } else if (book.status === "reading") {
        progress = book.progress;
      }
      updateBook(book.id, book.title, book.author, book.pages, progress).then(
        () => revalidator.revalidate(),
      );
    });
  }

  function handleDeletion() {
    if (
      window.confirm(
        "Are you sure you want to delete this book? Deleting this book will also delete any associated notes. Do you wish to continue?",
      )
    ) {
      deleteBook(book.id).then(() => revalidator.revalidate());
      return navigate("/library");
    }
  }

  async function generateSynthesis() {
    setIsLoading(true);
    openAiFunction(book.notes, selectedValue).then((response) => {
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

  const recentNoteElements = book.notes.slice(0, 3).map((note) => {
    return (
      <div key={note.id}>
        <h3>{note.note_title}</h3>
        <p className="italic capture">"{sliceString(note.capture)}"</p>
      </div>
    );
  });

  return (
    <div className="margin-inline">
      <div className="page-heading flex-row gap-lg padding-block">
        <Link to={`/library`} className="link-btn">
          &larr; Library
        </Link>
        &gt;
        <p className="italic">{book.title}</p>
      </div>

      {!isEditing ? (
        <>
          <div className="flex-row margin-block">
            <BookCover image={book.image} size="lg" />

            <div className="padding-inline book-info">
              <div className="flex-col">
                <Pill colour={book.status === "read" ? "brown" : "red"}>
                  {book.status === "read" ? "Read" : "Reading"}
                </Pill>
                <h3>{book.title}</h3>
                <p className="italic">{book.author}</p>
              </div>
              <div className="flex-row gap-lg margin-block">
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={changeBookStatus}>
                  Mark as {book.status === "reading" ? "read" : "reading"}
                </button>
                <button onClick={() => setShowModal(true)}>
                  Update progress
                </button>
                <UpdateProgress
                  showModal={showModal}
                  setShowModal={setShowModal}
                  book={book}
                />
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

          <div className="card card-red margin-block">
            <div className="flex-row space-between align-center">
              <h3>Notes</h3>
              <Link to={`/notes?book=${book.id}`} className="link-btn btn-red">
                View all notes &gt;
              </Link>
            </div>
            <div className="padding-inline padding-block">
              <p className="number">{book.notes.length}</p>
              <p>notes logged for this book</p>
            </div>
            <div className="notes book-notes">{recentNoteElements}</div>
          </div>

          <div className="border margin-block"></div>

          <div className="card card-red margin-block">
            <div className="flex-row space-between align-center">
              <h3 className="gold">Your Synthesis</h3>
              <div className="flex-row gap-lg">
                <button
                  onClick={generateSynthesis}
                  disabled={isLoading || book.notes.length === 0}
                  className="btn-red"
                >
                  <div className="icon-pill">
                    <FaCog />
                    {synthesis ? "Regenerate" : "Generate"} Synthesis
                  </div>
                </button>
                {book.syntheses.length > 0 && (
                  <Link
                    to={`/syntheses/${book.id}`}
                    className="link-btn btn-red"
                  >
                    View all syntheses &gt;
                  </Link>
                )}
              </div>
            </div>

            {book.notes.length > 0 && (
              <div className="padding-inline padding-block">
                <div className="flex-row gap-lg align-center">
                  <p>Length:</p>
                  <button
                    className={
                      selectedValue === "Short"
                        ? "selected filter-pill"
                        : "filter-pill"
                    }
                    type="button"
                    name="filter"
                    value="Short"
                    onClick={(e) => setSelectedValue(e.currentTarget.value)}
                    disabled={isLoading}
                  >
                    Short
                  </button>
                  <button
                    className={
                      selectedValue === "Standard"
                        ? "selected filter-pill"
                        : "filter-pill"
                    }
                    type="button"
                    name="filter"
                    value="Standard"
                    onClick={(e) => setSelectedValue(e.currentTarget.value)}
                    disabled={isLoading}
                  >
                    Standard
                  </button>
                  <button
                    className={
                      selectedValue === "Detailed"
                        ? "selected filter-pill"
                        : "filter-pill"
                    }
                    type="button"
                    name="filter"
                    value="Detailed"
                    onClick={(e) => setSelectedValue(e.currentTarget.value)}
                    disabled={isLoading}
                  >
                    Detailed
                  </button>
                </div>
              </div>
            )}

            {isLoading && <Loading text="Generating synthesis..." />}
            {!isLoading && (
              <div className="padding-inline">
                {synthesis ? (
                  <div>
                    <p className="gold">
                      Here is your personalised synthesis of {book.title}
                    </p>
                    <div className="margin-bottom">
                      {splitOnNewLine(synthesis).map((section) => (
                        <p key={section} className="margin-top">
                          {section}
                        </p>
                      ))}
                    </div>
                    <div className="border margin-block"></div>
                    {synthesis && (
                      <div className="margin-block align-right">
                        <p
                          className={
                            saveSynthesisMessage === "Synthesis saved"
                              ? "green"
                              : "red"
                          }
                        >
                          {saveSynthesisMessage}
                        </p>
                      </div>
                    )}
                    <div className="flex-row align-center space-between margin-block">
                      <p>
                        Generated from {book.notes.length} notes &middot;{" "}
                        {selectedValue} length
                      </p>
                      <button onClick={saveSynthesis}>Save Synthesis</button>
                    </div>
                  </div>
                ) : (
                  <div className="margin-block">
                    {book.notes.length > 0 ? (
                      <p>
                        No synthesis generated yet. Hit Generate Synthesis to
                        create a personalised summary based on your notes for
                        this book.
                      </p>
                    ) : (
                      <p>Add notes for this book to generate a synthesis.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="form margin-block">
          {errorMessage && <p className="red">{errorMessage}</p>}
          <label htmlFor="title" className="gold">
            Book Title
          </label>
          <input
            id="title"
            placeholder="Book title..."
            defaultValue={book.title}
            onChange={(e) => setBookTitle(e.currentTarget.value)}
          />
          <label htmlFor="author" className="gold">
            Author
          </label>
          <input
            id="author"
            placeholder="Author name..."
            defaultValue={book.author}
            onChange={(e) => setBookAuthor(e.currentTarget.value)}
          />
          <label htmlFor="pages" className="gold">
            Pages
          </label>
          <input
            id="pages"
            type="number"
            placeholder="Total number of pages..."
            defaultValue={book.pages}
            onChange={(e) => setBookPages(e.currentTarget.value)}
          />
          <label htmlFor="progress" className="gold">
            Progress
          </label>
          <input
            id="progress"
            type="number"
            placeholder="Number of pages read..."
            defaultValue={book.progress}
            onChange={(e) => setBookProgress(e.currentTarget.value)}
          />

          <div className="note-buttons">
            <div className="flex-row gap-lg">
              <button onClick={handleClick}>Save</button>
              <button
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
            <button onClick={handleDeletion} className="btn-red">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
