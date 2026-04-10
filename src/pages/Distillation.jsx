import React from "react";
import {
  addCard,
  getBook,
  getBuckets,
  getNotes,
  updateNoteStatus,
} from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";

export async function loader({ params }) {
  const notes = await getNotes(params.id);
  const buckets = await getBuckets();
  const book = await getBook(notes[0].book_id);
  return { notes, buckets, book };
}

export default function Distillation() {
  const { notes, buckets, book } = useLoaderData();
  const revalidator = useRevalidator();

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userResponses, setUserResponses] = React.useState({
    response1: "",
    response2: "",
  });
  const [userBucket, setUserBucket] = React.useState("");
  const [allBuckets, setAllBuckets] = React.useState(buckets);
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const [promoted, setPromoted] = React.useState(0);
  const [discarded, setDiscarded] = React.useState(0);
  const [skipped, setSkipped] = React.useState(0);
  const [showBuckets, setShowBuckets] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  function updateUserResponses(event) {
    const { value, name } = event.currentTarget;
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value,
    }));
  }

  function updateUserBucket(event) {
    setUserBucket(event.currentTarget.value);
  }

  function updateSelectedBuckets() {
    if (userBucket !== "") {
      setAllBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setSelectedBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      revalidator.revalidate();
    } else {
      console.log("empty name");
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

  function promoteNote() {
    if (userResponses.response1 === "" || userResponses.response2 === "") {
      setErrorMessage("Please answer all retention questions");
      return;
    }
    if (selectedBuckets.length === 0) {
      setErrorMessage("Please select at least one bucket");
      return;
    }
    addCard(
      notes[currentIndex],
      userResponses.response1,
      userResponses.response2,
      selectedBuckets,
    );
    setUserResponses({ response1: "", response2: "" });
    setSelectedBuckets([]);
    setCurrentIndex((prev) => prev + 1);
    setPromoted((prev) => prev + 1);
    updateNoteStatus(notes[currentIndex].id, "processed");
  }

  function discardNote() {
    setUserResponses({ response1: "", response2: "" });
    setCurrentIndex((prev) => prev + 1);
    setDiscarded((prev) => prev + 1);
    updateNoteStatus(notes[currentIndex].id, "processed");
  }

  function skipNote() {
    setUserResponses({ response1: "", response2: "" });
    setCurrentIndex((prev) => prev + 1);
    setSkipped((prev) => prev + 1);
    updateNoteStatus(notes[currentIndex].id, "inbox");
  }

  const bucketElements = allBuckets.map((bucket) => {
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

  return (
    <>
      <h1>Distillation</h1>
      {currentIndex < notes.length ? (
        <p className="text-sm">
          Note {currentIndex + 1} of {notes.length}
        </p>
      ) : null}

      {notes[currentIndex] ? (
        <div className="distillation-card">
          <div className="card main-card" key={notes[currentIndex].id}>
            <div className="main-card-header">
              <p className="nice-font card-title">
                {notes[currentIndex].note_title}
              </p>
              <div>
                <p>{book.title}</p>
                <p>p. {notes[currentIndex].page}</p>
              </div>
            </div>

            <div className="main-card-text">
              <p>
                <span className="bold">Context:</span>{" "}
                {notes[currentIndex].context.slice(0, 300)}
              </p>
              <p className="italic capture">
                {notes[currentIndex].capture.slice(0, 300)}
              </p>
              <div className="pill">
                <p>{notes[currentIndex].spark.slice(0, 300)}</p>
              </div>
            </div>

            <div className="retention-questions">
              {errorMessage && <p className="red">{errorMessage}</p>}
              <label htmlFor="question1">Why did this stop you?</label>
              <textarea
                id="question1"
                name="response1"
                onChange={updateUserResponses}
                value={userResponses.response1}
              ></textarea>
              <label htmlFor="question2">
                What does this connect to in your life or other reading?
              </label>
              <textarea
                id="question2"
                name="response2"
                onChange={updateUserResponses}
                value={userResponses.response2}
              ></textarea>
            </div>

            <div className="buckets">
              <div className="buckets-header">
                <button
                  onClick={() => setShowBuckets(!showBuckets)}
                  className="btn-dark btn-lg"
                >
                  Select Buckets
                </button>
                <Link
                  to="/manage-buckets"
                  state={{
                    from: `/book/${notes[currentIndex].book_id}/distillation`,
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
              )}
            </div>
          </div>

          <div className="distillation-buttons">
            <button onClick={promoteNote} className="btn-lg success">
              Promote
            </button>
            <button onClick={discardNote} className="btn-lg btn-delete">
              Discard
            </button>
            <button onClick={skipNote} className="btn-lg">
              Skip
            </button>
          </div>
        </div>
      ) : (
        <div className="card distillation-complete-container">
          <h2>Distillation Complete</h2>
          <p className="text-sm">
            You reviewed {notes.length} notes in this session.
          </p>
          <div className="distillation-stats">
            <div className="stat promoted">
              <p className="nice-font green text-lg">{promoted}</p>
              <p className="text-sm">Promoted</p>
            </div>
            <div className="stat discarded">
              <p className="nice-font red text-lg">{discarded}</p>
              <p className="text-sm">Discarded</p>
            </div>
            <div className="stat skipped">
              <p className="nice-font accent text-lg">{skipped}</p>
              <p className="text-sm">Skipped</p>
            </div>
          </div>
          <Link to="/bookshelf" className="link-btn link-btn-dark">
            Done
          </Link>
        </div>
      )}
    </>
  );
}
