import React from "react";
import {
  addBuckets,
  addCard,
  getBuckets,
  getNotes,
  updateNoteStatus,
} from "../api";
import { useLoaderData } from "react-router";

export async function loader({ params }) {
  const notes = await getNotes(params.id);
  const buckets = await getBuckets();
  return { notes, buckets };
}

export function action() {
  addBuckets();
}

export default function Distillation() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userResponses, setUserResponses] = React.useState({
    response1: "",
    response2: "",
  });
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const { notes, buckets } = useLoaderData();

  React.useEffect(() => {
    setSelectedBuckets(buckets);
  }, []);

  function updateUserResponses(event) {
    const { value, name } = event.currentTarget;
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value,
    }));
  }

  function promoteNote() {
    // if (userResponses.response1 === "" || userResponses.response2 === "") {
    //   alert("Please answer all retention questions");
    // }
    // if (selectedBuckets.length === 0) {
    //   alert("Please select at least one bucket");
    // }
    addCard(
      notes[currentIndex],
      userResponses.response1,
      userResponses.response2,
      selectedBuckets,
    );
    updateNoteStatus(notes[currentIndex].id);
    setCurrentIndex((prev) => prev + 1);
  }

  const bucketElements = selectedBuckets.map((bucket) => {
    return <button>{bucket.name}</button>;
  });

  return (
    <>
      <h1>Distillation</h1>

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
        <h3>Buckets</h3>
        <label htmlFor="add-bucket">Add Bucket</label>
        <input id="add-bucket" name="bucket-name" placeholder="e.g. Mindset" />
        <button>Add Bucket</button>
      </div>

      <div className="distillation-buttons">
        <button onClick={promoteNote}>Promote</button>
        <button>Discard</button>
        <button onClick={() => setCurrentIndex((prev) => prev + 1)}>
          Skip
        </button>
      </div>
    </>
  );
}
