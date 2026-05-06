import React from "react";
import {
  deleteNote,
  getBook,
  getNote,
  getNoteBuckets,
  getBuckets,
  updateNote,
  deleteNoteBucket,
} from "../api";
import { Link, useLoaderData, useNavigate, useRevalidator } from "react-router";
import { validatePageRange } from "../utils";
import { FaBookOpen } from "react-icons/fa";
import Pill from "../components/Pill";
import useClickOutside from "../components/hooks/useClickOutside";

export async function loader({ params }) {
  const note = await getNote(params.id);
  if (note.length === 0) {
    return { note: null, buckets: [] };
  }

  const { buckets } = await getBuckets();
  return { note, buckets };
}

export default function Note() {
  const { note, buckets } = useLoaderData();
  const revalidator = useRevalidator();
  const addBucketRef = React.useRef(null);
  const navigate = useNavigate();

  const noteBuckets = note?.buckets.map((bucket) => bucket.name);

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(note?.note_title);
  const [page, setPage] = React.useState(note?.page);
  const [context, setContext] = React.useState(note?.context);
  const [capture, setCapture] = React.useState(note?.capture);
  const [spark, setSpark] = React.useState(note?.spark);
  const [userBucket, setUserBucket] = React.useState("");
  const [allBuckets, setAllBuckets] = React.useState(buckets);
  const [selectedBuckets, setSelectedBuckets] = React.useState(
    noteBuckets || [],
  );
  const [showBucketInput, setShowBucketInput] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [bucketErrorMessage, setBucketErrorMessage] = React.useState("");

  useClickOutside(addBucketRef, () => updateSelectedNoteBuckets());

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
    if (isEditing) {
      if (!noteTitle) {
        setErrorMessage("Title is required");
        return;
      }
      if (!page) {
        setErrorMessage("Page is required");
        return;
      }
      if (!context && !capture && !spark) {
        setErrorMessage(
          "At least one of context, capture, or spark is required",
        );
        return;
      }
      if (selectedBuckets.length === 0 && isEditing) {
        setErrorMessage("At least one bucket is required");
        return;
      }

      note.buckets.map((bucket) => {
        if (!selectedBuckets.includes(bucket.name)) {
          deleteNoteBucket(bucket.name);
        }
      });

      validatePageRange(page);
      updateNote(
        note.id,
        noteTitle,
        page,
        context,
        capture,
        spark,
        selectedBuckets,
      ).then(() => revalidator.revalidate());
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }

  function updateSelectedNoteBuckets() {
    if (userBucket !== "") {
      setAllBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setSelectedBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setUserBucket("");
      setShowBucketInput(false);
      setBucketErrorMessage("");
      revalidator.revalidate();
    } else {
      setBucketErrorMessage("Bucket must have a name");
    }
  }

  function updateUserBucket(event) {
    setUserBucket(event.currentTarget.value);
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
      return navigate(`/notes`);
    }
  }

  const noteButtons = (
    <div className="note-buttons">
      <button onClick={handleClick}>{isEditing ? "Save" : "Edit"}</button>
      {isEditing ? (
        <button
          onClick={() => {
            setIsEditing(false);
            setShowBucketInput(false);
            setBucketErrorMessage("");
          }}
        >
          Cancel
        </button>
      ) : null}
      {!isEditing ? (
        <button onClick={handleDeletion} className="btn-red">
          Delete
        </button>
      ) : null}
    </div>
  );

  const allBucketElements = allBuckets.map((bucket) => {
    return (
      <Pill
        colour={selectedBuckets.includes(bucket) ? "gold" : "std"}
        border="border"
        key={bucket}
        onClick={() => toggleBucket(bucket)}
      >
        {bucket}
      </Pill>
    );
  });

  return (
    <div className="padding-inline">
      <div className="page-heading flex-col align-left">
        <div className="flex-row gap-lg align-center padding-top">
          <Link to={navigate(-1)} className="link-btn">
            &larr; Notes
          </Link>
          &gt;
          <p className="italic">{note.note_title}</p>
        </div>
        <div className="margin-bottom margin-top">
          <div className="icon-pill gold">
            <FaBookOpen />
            <p>{note.books.title}</p>
          </div>
          <h3>{note.note_title}</h3>
          <p>
            p. {note.page} &middot; logged on {""}
            {new Date(note.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
          </p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="margin-block flex-row">
            {note.buckets.map((bucket) => (
              <Pill key={bucket.id} colour="gold">
                {bucket.name}
              </Pill>
            ))}
          </div>

          <div className="card main-card" key={note.id}>
            <div className="flex-col">
              {note.context && (
                <>
                  <p>{note.context}</p>
                  <div className="border margin-block"></div>
                </>
              )}
              <p className="italic capture">"{note.capture}"</p>
              {note.spark && (
                <>
                  <div className="border margin-block"></div>
                  <p>{note.spark}</p>
                </>
              )}
            </div>
          </div>
          {noteButtons}
        </>
      ) : (
        <div className="form">
          {errorMessage && <p className="red">{errorMessage}</p>}
          <div>
            <label htmlFor="note-title" className="gold">
              Note Title
            </label>
            <input
              id="note-title"
              defaultValue={note.note_title}
              onChange={(e) => setNoteTitle(e.currentTarget.value)}
            />
          </div>
          <div>
            <label htmlFor="page" className="gold">
              Page
            </label>
            <input
              id="page"
              defaultValue={note.page}
              onChange={(e) => setPage(e.currentTarget.value)}
            />
          </div>
          <label htmlFor="context" className="gold">
            Context
          </label>
          <textarea
            id="context"
            defaultValue={note.context}
            onChange={(e) => setContext(e.currentTarget.value)}
          ></textarea>
          <label htmlFor="capture" className="gold">
            Capture (passage from the book){" "}
          </label>
          <textarea
            id="capture"
            defaultValue={note.capture}
            onChange={(e) => setCapture(e.currentTarget.value)}
          ></textarea>
          <label htmlFor="spark" className="gold">
            Spark (your thought/reaction){" "}
          </label>
          <textarea
            id="spark"
            defaultValue={note.spark}
            onChange={(e) => setSpark(e.currentTarget.value)}
          ></textarea>

          <div className="buckets">
            <div className="buckets-header">
              <p className="gold">Buckets</p>
            </div>

            <div className="bucket-buttons">{allBucketElements}</div>
            <div className="add-bucket">
              {!showBucketInput ? (
                <Pill
                  colour="std"
                  className="icon-pill"
                  border="border"
                  onClick={() => setShowBucketInput(true)}
                >
                  &#43; New bucket
                </Pill>
              ) : (
                <input
                  ref={addBucketRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateSelectedNoteBuckets();
                    }
                  }}
                  onChange={updateUserBucket}
                  placeholder="Bucket name..."
                  value={userBucket}
                />
              )}
            </div>
            {bucketErrorMessage && <p className="red">{bucketErrorMessage}</p>}
          </div>
          {noteButtons}
        </div>
      )}
    </div>
  );
}
