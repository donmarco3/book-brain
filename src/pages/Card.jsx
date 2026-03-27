import React from "react";
import { addBucket, deleteCard, getBuckets, getCard, updateCard } from "../api";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
} from "react-router";
import { validatePageRange } from "../utils";

export async function loader({ params }) {
  const card = await getCard(params.id);
  const buckets = await getBuckets();
  if (!card) {
    return { card: null, buckets: [] };
  }
  return { card, buckets };
}

export default function Card() {
  const { card, buckets } = useLoaderData();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(card?.noteTitle) || "";
  const [page, setPage] = React.useState(card?.page || null);
  const [context, setContext] = React.useState(card?.context || "");
  const [capture, setCapture] = React.useState(card?.capture || "");
  const [spark, setSpark] = React.useState(card?.spark || "");
  const [response1, setResponse1] = React.useState(card?.response1 || "");
  const [response2, setResponse2] = React.useState(card?.response2 || "");
  const [userBucket, setUserBucket] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState(
    card?.buckets || [],
  );
  const [errorMessage, setErrorMessage] = React.useState("");

  if (!card) {
    return (
      <>
        <h1>Card not found.</h1>
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
    if (selectedBuckets.length === 0) {
      setErrorMessage("At least one bucket is required");
      return;
    }

    try {
      validatePageRange(page);
      updateCard(
        card.id,
        noteTitle,
        page,
        context,
        capture,
        spark,
        response1,
        response2,
        selectedBuckets,
      );
      setIsEditing((prev) => !prev);
      revalidator.revalidate();
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }
  }

  function updateUserBucket(event) {
    setUserBucket(event.currentTarget.value);
  }

  function updateSelectedBuckets() {
    setSelectedBuckets((prevBuckets) => [...prevBuckets, userBucket]);
    addBucket(userBucket);
    revalidator.revalidate();
  }

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this card?")) {
      deleteCard(card.id);
      return navigate("/library");
    }
  }

  const bucketElements = card.buckets.map((bucket) => {
    if (buckets.some((item) => item.name === bucket)) {
      return (
        <p key={bucket} className="pill">
          {bucket}
        </p>
      );
    }
  });

  const allBucketElements = buckets.map((bucket) => {
    return (
      <button
        className={
          selectedBuckets.includes(bucket.name) ? "bucket btn-dark" : "bucket"
        }
        key={bucket.id}
        onClick={() => toggleBucket(bucket.name)}
      >
        {bucket.name}
      </button>
    );
  });

  const search = location.state ? location.state.search : "";
  const pathName = location.state ? location.state.from : "/library";

  let pathNameText;
  if (pathName === "/library") {
    pathNameText = "Library";
  } else {
    pathNameText = "Home";
  }

  return (
    <>
      <div className="log-header">
        <Link
          to={pathName === "/library" ? `/library${search}` : "/"}
          className="link-btn"
        >
          &larr; Back to {pathNameText}
        </Link>
        <h1>{card.noteTitle}</h1>
      </div>
      <div className="card main-card card-content" key={card.id}>
        {!isEditing ? (
          <>
            <div className="main-card-header">
              <p className="nice-font card-title">{card.noteTitle}</p>
              <div>
                <p>p. {card.page}</p>
              </div>
            </div>

            <div className="main-card-buckets">{bucketElements}</div>

            <div className="main-card-text">
              <p>
                <span className="bold">Context:</span> {card.context}
              </p>
              <p className="italic capture">{card.capture}</p>
              <div className="pill">
                <p>{card.spark}</p>
              </div>
              <p className="bold">{card.question1}</p>
              <p>{card.response1}</p>
              <p className="bold">{card.question2}</p>
              <p>{card.response2}</p>
            </div>
          </>
        ) : (
          <div className="note-editing">
            <p>
              <span className="bold">Book:</span>{" "}
              <span className="nice-font">{card.bookTitle}</span>
            </p>
            {errorMessage && <p className="red">{errorMessage}</p>}
            <div className="note-editing-header">
              <div>
                <label htmlFor="card-note-title">
                  Card Title <span className="required-field">*</span>
                </label>
                <input
                  id="card-note-title"
                  defaultValue={card.noteTitle}
                  onChange={(e) => setNoteTitle(e.currentTarget.value)}
                />
              </div>
              <div>
                <label htmlFor="card-page">
                  Page <span className="required-field">*</span>
                </label>
                <input
                  id="card-page"
                  defaultValue={card.page}
                  onChange={(e) => setPage(e.currentTarget.value)}
                />
              </div>
            </div>
            <label htmlFor="card-context">Context</label>
            <textarea
              id="card-context"
              defaultValue={card.context}
              onChange={(e) => setContext(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-capture">
              Capture (passage from the book){" "}
            </label>
            <textarea
              id="card-capture"
              defaultValue={card.capture}
              onChange={(e) => setCapture(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-spark">Spark (your thought/reaction) </label>
            <textarea
              id="card-spark"
              defaultValue={card.spark}
              onChange={(e) => setSpark(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-question1">
              {card.question1} <span className="required-field">*</span>
            </label>
            <textarea
              id="card-question1"
              defaultValue={card.response1}
              onChange={(e) => setResponse1(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-question2">
              {card.question2} <span className="required-field">*</span>
            </label>
            <textarea
              id="card-question2"
              defaultValue={card.response2}
              onChange={(e) => setResponse2(e.currentTarget.value)}
            ></textarea>

            <div className="buckets">
              <div className="buckets-header">
                <p>
                  Select Buckets <span className="required-field">*</span>
                </p>
                <Link
                  to="/manage-buckets"
                  state={{ from: `/card/${card.id}` }}
                  className="link-btn"
                >
                  Manage Buckets
                </Link>
              </div>
              <div className="buckets-expanded">
                <div className="bucket-buttons">{allBucketElements}</div>
                <div className="add-bucket">
                  <input
                    onChange={updateUserBucket}
                    placeholder="e.g. Mindset"
                  />
                  <button
                    className="btn-dark btn-lg"
                    onClick={updateSelectedBuckets}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="note-buttons">
          <button className="btn-dark btn-lg" onClick={handleClick}>
            {isEditing ? "Save" : "Edit"}
          </button>
          {isEditing ? (
            <button className="btn-lg" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          ) : null}
          {!isEditing ? (
            <button className="btn-delete" onClick={handleDeletion}>
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
