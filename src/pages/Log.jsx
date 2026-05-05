import React from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useLocation,
} from "react-router";
import { addNote, getAllBooks, getBook, getBuckets } from "../api";
import { validatePageRange } from "../utils";
import Pill from "../components/Pill";
import useClickOutside from "../components/hooks/useClickOutside";

export async function loader() {
  const books = await getAllBooks();
  const buckets = await getBuckets();
  return { books, buckets };
}

export async function action({ request }) {
  const formData = await request.formData();
  const note_title = formData.get("note-title");
  const page = formData.get("book-page");
  const context = formData.get("note-context");
  const capture = formData.get("note-capture");
  const spark = formData.get("note-spark");
  const book = formData.get("book");
  const buckets = formData.getAll("buckets");

  if (!note_title) {
    return { error: "Title is required" };
  }
  if (!page) {
    return { error: "Page is required" };
  }
  if (!context && !capture && !spark) {
    return { error: "At least one of context, capture, or spark is required" };
  }
  if (!book) {
    return { error: "Must select a book" };
  }
  if (buckets.length === 0) {
    return { error: "At least one bucket must be selected" };
  }

  try {
    await validatePageRange(page);
    await addNote(
      note_title,
      book.book_id,
      page,
      context,
      capture,
      spark,
      buckets,
    );
    return redirect(`/library`);
  } catch (error) {
    return { error: error.message };
  }
}

export default function Log() {
  const { books, buckets } = useLoaderData();
  const actionData = useActionData();
  const location = useLocation();
  const addBucketRef = React.useRef(null);

  const pathName = location.state ? location.state.from : "/library";
  const book = location.state && location.state.book;

  const [userBucket, setUserBucket] = React.useState("");
  const [allBuckets, setAllBuckets] = React.useState(buckets);
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState(book);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [bucketErrorMessage, setBucketErrorMessage] = React.useState("");
  const [showBucketInput, setShowBucketInput] = React.useState(false);

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    }
  }, [actionData]);

  useClickOutside(addBucketRef, () => updateSelectedNoteBuckets());

  let pathNameText;
  if (pathName === "/library") {
    pathNameText = "Library";
  } else if (pathName === "/notes") {
    pathNameText = "Notes";
  } else {
    pathNameText = "Home";
  }

  function updateUserBucket(event) {
    setUserBucket(event.currentTarget.value);
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

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }
  }

  const bucketElements = allBuckets.map((bucket) => {
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

  const bookElements = books.map((book) => {
    return (
      <option value={book.title} key={book.id}>
        {book.title}
      </option>
    );
  });

  return (
    <div className="margin-inline">
      <div className="page-heading flex-col">
        <div className="flex-row gap-lg align-center padding-top">
          <Link to={pathName} className="link-btn">
            &larr; {pathNameText}
          </Link>
          &gt;
          <p className="italic">Log Note</p>
        </div>
        <div className="margin-bottom margin-top">
          <h1 className="margin-none">Log Note</h1>
          <p className="gold margin-top">Book</p>
          {book ? (
            <div className="book-container">
              <p>{book.title}</p>
              <p className="italic">{book.author}</p>
            </div>
          ) : (
            <select
              onChange={(e) => setSelectedBook(e.target.value)}
              className="book-container"
            >
              <option>Select a book...</option>
              {bookElements}
            </select>
          )}
        </div>
      </div>

      <Form method="post" className="form margin-block" replace>
        {errorMessage && (
          <p className="red error margin-bottom">{errorMessage}</p>
        )}
        <div>
          <label htmlFor="note-title" className="gold">
            Title
          </label>
          <input
            id="note-title"
            name="note-title"
            placeholder="Note title..."
          />
        </div>
        <div>
          <label htmlFor="book-page" className="gold">
            Page
          </label>
          <input
            id="book-page"
            name="book-page"
            placeholder="Page or page range..."
          />
        </div>
        <label htmlFor="note-context" className="gold">
          Context
        </label>
        <textarea
          id="note-context"
          name="note-context"
          placeholder="Summarise the key idea in your own words..."
          rows={3}
        ></textarea>
        <label htmlFor="note-capture" className="gold">
          Capture (passage from the book){" "}
        </label>
        <textarea
          id="note-capture"
          name="note-capture"
          placeholder="Copy a quote or passage from the book..."
          rows={3}
        ></textarea>
        <label htmlFor="note-spark" className="gold">
          Spark (your thought/reaction){" "}
        </label>
        <textarea
          id="note-spark"
          name="note-spark"
          placeholder="What does this make you think? Any connections or reactions?"
          rows={3}
        ></textarea>
        {selectedBuckets.map((bucket) => (
          <input
            key={bucket}
            type="hidden"
            name="buckets"
            value={bucket}
          ></input>
        ))}
        <input type="hidden" name="book" value={selectedBook} />

        <div className="buckets">
          <div className="buckets-header">
            <p className="gold">Buckets</p>
          </div>

          <div className="bucket-buttons">{bucketElements}</div>
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

        <div className="note-buttons">
          <button className="btn-dark" type="submit">
            Save Note
          </button>
        </div>
      </Form>
    </div>
  );
}
