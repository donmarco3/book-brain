import React from "react";
import { addBucket, deleteCard, getBuckets, getCard, updateCard } from "../api";
import { useLoaderData, useNavigate, useRevalidator } from "react-router";

export async function loader({ params }) {
  const card = await getCard(params.id);
  const buckets = await getBuckets();
  return { card, buckets };
}

export default function Card() {
  const { card, buckets } = useLoaderData();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState(card.noteTitle);
  const [page, setPage] = React.useState(card.page);
  const [context, setContext] = React.useState(card.context);
  const [capture, setCapture] = React.useState(card.capture);
  const [spark, setSpark] = React.useState(card.spark);
  const [response1, setResponse1] = React.useState(card.response1);
  const [response2, setResponse2] = React.useState(card.response2);
  const [userBucket, setUserBucket] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState(card.buckets);

  function handleClick() {
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
      <h1>Card</h1>
      <div className="card card-content" key={card.id}>
        {!isEditing ? (
          <div>
            <h2>{card.noteTitle}</h2>
            <p>{card.bookTitle}</p>
            <p>{card.page}</p>
            <p>{card.context}</p>
            <p>{card.capture}</p>
            <p>{card.spark}</p>
            <p>{card.question1}</p>
            <p>{card.response1}</p>
            <p>{card.question2}</p>
            <p>{card.response2}</p>
            <p>{card.buckets}</p>
          </div>
        ) : (
          <div>
            <label htmlFor="card-note-title">Title</label>
            <input
              id="card-note-title"
              defaultValue={card.noteTitle}
              onChange={(e) => setNoteTitle(e.currentTarget.value)}
            />
            <p>{card.bookTitle}</p>
            <label htmlFor="card-page">Page</label>
            <input
              id="card-page"
              defaultValue={card.page}
              onChange={(e) => setPage(e.currentTarget.value)}
            />
            <label htmlFor="card-context">Context</label>
            <textarea
              id="card-context"
              defaultValue={card.context}
              onChange={(e) => setContext(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-capture">Capture</label>
            <textarea
              id="card-capture"
              defaultValue={card.capture}
              onChange={(e) => setCapture(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-spark">Spark</label>
            <textarea
              id="card-spark"
              defaultValue={card.spark}
              onChange={(e) => setSpark(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-question1">{card.question1}</label>
            <textarea
              id="card-question1"
              defaultValue={card.response1}
              onChange={(e) => setResponse1(e.currentTarget.value)}
            ></textarea>
            <label htmlFor="card-question2">{card.question2}</label>
            <textarea
              id="card-question2"
              defaultValue={card.response2}
              onChange={(e) => setResponse2(e.currentTarget.value)}
            ></textarea>

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
          </div>
        )}
        <button onClick={handleClick}>{isEditing ? "Save" : "Edit"}</button>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        ) : null}
        {!isEditing ? <button onClick={handleDeletion}>Delete</button> : null}
      </div>
    </>
  );
}
