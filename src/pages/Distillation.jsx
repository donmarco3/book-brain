import React from "react";
import {
  addBucket,
  addCard,
  getBuckets,
  getNotes,
  updateNoteStatus,
} from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";

export async function loader({ params }) {
  const notes = await getNotes(params.id);
  const buckets = await getBuckets();
  return { notes, buckets };
}

export default function Distillation() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userResponses, setUserResponses] = React.useState({
    response1: "",
    response2: "",
  });
  const [userBucket, setUserBucket] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const [promoted, setPromoted] = React.useState(0);
  const [discarded, setDiscarded] = React.useState(0);
  const [skipped, setSkipped] = React.useState(0);
  const { notes, buckets } = useLoaderData();
  const revalidator = useRevalidator();

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

  function promoteNote() {
    if (userResponses.response1 === "" || userResponses.response2 === "") {
      alert("Please answer all retention questions");
    }
    if (selectedBuckets.length === 0) {
      alert("Please select at least one bucket");
    }
    addCard(
      notes[currentIndex],
      userResponses.response1,
      userResponses.response2,
      selectedBuckets,
    );
    updateNoteStatus(notes[currentIndex].id);
    setCurrentIndex((prev) => prev + 1);
    setPromoted((prev) => prev + 1);
  }

  function discardNote() {
    setCurrentIndex((prev) => prev + 1);
    setDiscarded((prev) => prev + 1);
  }

  function skipNote() {
    setCurrentIndex((prev) => prev + 1);
    setSkipped((prev) => prev + 1);
  }

  const bucketElements = buckets.map((bucket) => {
    return (
      <button
        className={
          selectedBuckets.includes(bucket.name) ? "bucket selected" : "bucket"
        }
        key={bucket.id}
        onClick={() => toggleBucket(bucket.name)}
      >
        {bucket.name}
      </button>
    );
  });

  return (
    <>
      <h1>Distillation</h1>

      {notes[currentIndex] ? (
        <div>
          <div className="card" key={notes[currentIndex].id}>
            <p>{notes[currentIndex].title}</p>
            <p>{notes[currentIndex].page}</p>
            <p>{notes[currentIndex].context}</p>
            <p>{notes[currentIndex].capture}</p>
            <p>{notes[currentIndex].spark}</p>
          </div>

          <div className="retention-questions">
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
            <p>Buckets</p>
            {bucketElements}
            <div className="add-bucket-container">
              <label htmlFor="add-bucket">Add Bucket</label>
              <input
                id="add-bucket"
                name="bucket-name"
                placeholder="e.g. Mindset"
                onChange={updateUserBucket}
              />
              <button onClick={updateSelectedBuckets}>Add Bucket</button>
            </div>
          </div>

          <div className="distillation-buttons">
            <button onClick={promoteNote}>Promote</button>
            <button onClick={discardNote}>Discard</button>
            <button onClick={skipNote}>Skip</button>
          </div>
        </div>
      ) : (
        <div className="distillation-complete-container">
          <h2>Distillation Complete</h2>
          <p>You reviewed {notes.length} notes in this session.</p>
          <div className="distillation-stats">
            <div className="stat promoted">
              <p>{promoted}</p>
              <p>Promoted</p>
            </div>
            <div className="stat discarded">
              <p>{discarded}</p>
              <p>Discarded</p>
            </div>
            <div className="stat skipped">
              <p>{skipped}</p>
              <p>skipped</p>
            </div>
          </div>
          <Link to="/bookshelf">Done</Link>
        </div>
      )}
    </>
  );
}
