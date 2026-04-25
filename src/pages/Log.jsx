import React from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useLocation,
} from "react-router";
import { addNote, getBook, getBuckets } from "../api";
import { validatePageRange } from "../utils";

export async function loader({ params }) {
  const book = await getBook(params.id);
  const buckets = await getBuckets();
  return { book, buckets };
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const book = await getBook(params.id);
  const title = formData.get("note-title");
  const page = formData.get("book-page");
  const context = formData.get("note-context");
  const capture = formData.get("note-capture");
  const spark = formData.get("note-spark");
  const buckets = formData.getAll("buckets");

  if (!title) {
    return { error: "Title is required" };
  }
  if (!page) {
    return { error: "Page is required" };
  }
  if (!context && !capture && !spark) {
    return { error: "At least one of context, capture, or spark is required" };
  }

  try {
    await validatePageRange(page);
    await addNote({ title, page, context, capture, spark }, book, buckets);
    return redirect(`/library`);
  } catch (error) {
    return { error: error.message };
  }
}

export default function Log() {
  const { book, buckets } = useLoaderData();
  const actionData = useActionData();
  const location = useLocation();

  const [userBucket, setUserBucket] = React.useState("");
  const [allBuckets, setAllBuckets] = React.useState(buckets);
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const [showBuckets, setShowBuckets] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    }
  }, [actionData]);

  function updateUserBucket(event) {
    setUserBucket(event.currentTarget.value);
  }

  function updateSelectedBuckets() {
    if (userBucket !== "") {
      setAllBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setSelectedBuckets((prevBuckets) => [...prevBuckets, userBucket]);
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

  const pathName = location.state ? location.state.from : "/library";

  let pathNameText;
  if (pathName === "/library") {
    pathNameText = "Library";
  } else {
    pathNameText = "Home";
  }

  const bucketElements = allBuckets.map((bucket) => {
    return (
      <button
        className={
          selectedBuckets.includes(bucket) ? "bucket btn-dark" : "bucket"
        }
        key={bucket}
        onClick={() => toggleBucket(bucket)}
        type="button"
      >
        {bucket}
      </button>
    );
  });

  return (
    <>
      <div className="log-header">
        <Link to={pathName} className="link-btn">
          &larr; Back to {pathNameText}
        </Link>
        <h1>Log Note</h1>
        <p>
          {book.title} by {book.author}
        </p>
      </div>

      <Form method="post" className="form" replace>
        <h2>New Note</h2>
        {errorMessage && <p className="red error">{errorMessage}</p>}
        <div className="form-header">
          <div>
            <label htmlFor="note-title" className="bold">
              Title <span className="required-field">*</span>
            </label>
            <input id="note-title" name="note-title" placeholder="Note title" />
          </div>
          <div>
            <label htmlFor="book-page" className="bold">
              Page <span className="required-field">*</span>
            </label>
            <input
              id="book-page"
              name="book-page"
              placeholder="Page or page range"
            />
          </div>
        </div>
        <label htmlFor="note-context" className="bold">
          Context
        </label>
        <textarea
          id="note-context"
          name="note-context"
          placeholder="Summarise the key idea in your own words..."
          rows={3}
        ></textarea>
        <label htmlFor="note-capture" className="bold">
          Capture (passage from the book){" "}
        </label>
        <textarea
          id="note-capture"
          name="note-capture"
          placeholder="Copy a quote or passage from the book..."
          rows={3}
        ></textarea>
        <label htmlFor="note-spark" className="bold">
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

        <div className="buckets">
          <div className="buckets-header">
            <button
              onClick={() => setShowBuckets(!showBuckets)}
              className="btn-dark"
              type="button"
            >
              Select Buckets
            </button>
            <Link
              to="/manage-buckets"
              state={{
                from: `/book/${book.id}/log`,
              }}
              className="link-btn"
            >
              Manage Buckets
            </Link>
          </div>

          {showBuckets && (
            <div className="buckets-expanded">
              <div className="bucket-buttons">{bucketElements}</div>
              <div className="add-bucket">
                <input onChange={updateUserBucket} placeholder="e.g. Mindset" />
                <button
                  className="btn-dark "
                  onClick={updateSelectedBuckets}
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="note-buttons">
          <button className="btn-dark" type="submit">
            Save Note
          </button>
        </div>
      </Form>
    </>
  );
}
