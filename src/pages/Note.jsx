import React from "react";
import {
  deleteNote,
  getBook,
  getNote,
  getNoteBuckets,
  getBuckets,
  updateNote,
} from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";
import { validatePageRange } from "../utils";

export async function loader({ params }) {
  const note = await getNote(params.id);
  if (note.length === 0) {
    return { note: null, buckets: [] };
  }

  const book = await getBook(note.book_id);
  const noteBuckets = await getNoteBuckets(note.id);
  const userBuckets = await getBuckets();
  return { note, noteBuckets, userBuckets, book };
}

export default function Note() {
  const { note, noteBuckets, userBuckets, book } = useLoaderData();
  const revalidator = useRevalidator();

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(note?.note_title);
  const [page, setPage] = React.useState(note?.page);
  const [context, setContext] = React.useState(note?.context);
  const [capture, setCapture] = React.useState(note?.capture);
  const [spark, setSpark] = React.useState(note?.spark);
  const [userBucket, setUserBucket] = React.useState("");
  const [allBuckets, setAllBuckets] = React.useState(userBuckets);
  const [selectedBuckets, setSelectedBuckets] = React.useState(
    noteBuckets || [],
  );
  const [errorMessage, setErrorMessage] = React.useState("");

  if (!note) {
    return (
      <>
        <h1>Note not found.</h1>
        <Link to="/library" className="link-btn link-btn-dark">
          Back to Library
        </Link>
      </>
    );
  }

  function handleClick() {
    if (!noteTitle) {
      setErrorMessage("Title is required");
      return;
    }
    if (!page) {
      setErrorMessage("Page is required");
      return;
    }
    if (!context && !capture && !spark) {
      setErrorMessage("At least one of context, capture, or spark is required");
      return;
    }

    try {
      validatePageRange(page);
      updateNote(
        note.id,
        noteTitle,
        page,
        context,
        capture,
        spark,
        selectedBuckets,
      );
      setIsEditing((prev) => !prev);
      revalidator.revalidate();
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }
  }

  function updateSelectedBuckets() {
    if (userBucket !== "") {
      setAllBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setSelectedBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setUserBucket("");
      revalidator.revalidate();
    } else {
      setErrorMessage("Bucket must have a name");
    }
  }

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(note.id);
      return navigate(`/bookshelf`);
    }
  }

  const noteButtons = (
    <div className="note-buttons">
      <button onClick={handleClick} className="btn-dark">
        {isEditing ? "Save" : "Edit"}
      </button>
      {isEditing ? (
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      ) : null}
      {!isEditing ? (
        <button onClick={handleDeletion} className="btn-delete">
          Delete
        </button>
      ) : null}
    </div>
  );

  const allBucketElements = allBuckets.map((bucket) => {
    return (
      <button
        className={
          selectedBuckets.includes(bucket) ? "bucket btn-dark" : "bucket"
        }
        key={bucket}
        onClick={() => toggleBucket(bucket)}
      >
        {bucket}
      </button>
    );
  });

  const search = location.state ? location.state.search : "";
  const pathName = location.state ? location.state.from : "/notes";

  let pathNameText;
  if (pathName === "/notes") {
    pathNameText = "Notes";
  } else {
    pathNameText = "Home";
  }

  return (
    <>
      <div className="log-header">
        <Link
          to={pathName === "/notes" ? `/notes${search}` : "/"}
          className="link-btn"
        >
          &larr; Back to {pathNameText}
        </Link>
        <h1>{note.note_title}</h1>
      </div>

      {!isEditing ? (
        <div className="card main-card">
          <div className="main-card-header">
            <p className="nice-font card-title">{note.note_title}</p>
            <div>
              <p>{book.title}</p>
              <p>p. {note.page}</p>
            </div>
          </div>

          <div className="main-card-text">
            {note.context && (
              <p>
                <span className="bold">Context:</span> {note.context}
              </p>
            )}
            {note.capture && <p className="italic capture">{note.capture}</p>}
            <div className="pill">
              <p>{note.spark}</p>
            </div>
          </div>
          {noteButtons}
        </div>
      ) : (
        <div className="form">
          <p>
            <span className="bold">Book:</span>{" "}
            <span className="nice-font">{book.title}</span>
          </p>
          {errorMessage && <p className="red">{errorMessage}</p>}
          <div className="form-header">
            <div>
              <label htmlFor="note-note-title" className="bold">
                Note Title <span className="required-field">*</span>
              </label>
              <input
                id="note-note-title"
                defaultValue={note.note_title}
                onChange={(e) => setNoteTitle(e.currentTarget.value)}
              />
            </div>
            <div>
              <label htmlFor="note-page" className="bold">
                Page <span className="required-field">*</span>
              </label>
              <input
                id="note-page"
                defaultValue={note.page}
                onChange={(e) => setPage(e.currentTarget.value)}
              />
            </div>
          </div>
          <label htmlFor="note-context" className="bold">
            Context
          </label>
          <textarea
            id="note-context"
            defaultValue={note.context}
            onChange={(e) => setContext(e.currentTarget.value)}
            rows={3}
          ></textarea>
          <label htmlFor="note-capture" className="bold">
            Capture (passage from the book){" "}
          </label>
          <textarea
            id="note-capture"
            defaultValue={note.capture}
            onChange={(e) => setCapture(e.currentTarget.value)}
            rows={3}
          ></textarea>
          <label htmlFor="note-spark" className="bold">
            Spark (your thought/reaction){" "}
          </label>
          <textarea
            id="note-spark"
            defaultValue={note.spark}
            onChange={(e) => setSpark(e.currentTarget.value)}
            rows={3}
          ></textarea>

          <div className="buckets">
            <div className="buckets-header">
              <p className="bold">
                Select Buckets <span className="required-field">*</span>
              </p>
              <Link
                to="/manage-buckets"
                state={{ from: `/note/${note.id}` }}
                className="link-btn"
              >
                Manage Buckets
              </Link>
            </div>
            <div className="buckets-expanded">
              <div className="bucket-buttons">{allBucketElements}</div>
              <div className="add-bucket">
                <input
                  onChange={(e) => setUserBucket(e.currentTarget.value)}
                  placeholder="e.g. Mindset"
                  value={userBucket}
                />
                <button className="btn-dark" onClick={updateSelectedBuckets}>
                  Add
                </button>
              </div>
            </div>
          </div>

          {noteButtons}
        </div>
      )}
    </>
  );
}
