import React from "react";
import { getBuckets, getCards } from "../api";
import { Link, useLoaderData } from "react-router";

export async function loader() {
  const cards = await getCards();
  const buckets = await getBuckets();
  return { cards, buckets };
}

export default function Library() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const { cards, buckets } = useLoaderData();

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }
  }

  const filteredCards = cards.filter((card) => {
    const filteredBuckets = selectedBuckets.every((bucket) =>
      card.buckets.includes(bucket),
    );

    if (searchQuery.toLowerCase() === "" && selectedBuckets.length === 0) {
      return card;
    } else if (searchQuery.toLowerCase() && selectedBuckets.length > 0) {
      return (
        (card.noteTitle.toLowerCase().includes(searchQuery) ||
          card.bookTitle.toLowerCase().includes(searchQuery) ||
          card.context.toLowerCase().includes(searchQuery) ||
          card.capture.toLowerCase().includes(searchQuery) ||
          card.spark.toLowerCase().includes(searchQuery) ||
          card.question1.toLowerCase().includes(searchQuery) ||
          card.question2.toLowerCase().includes(searchQuery)) &&
        filteredBuckets
      );
    } else if (searchQuery.toLowerCase()) {
      return (
        card.noteTitle.toLowerCase().includes(searchQuery) ||
        card.bookTitle.toLowerCase().includes(searchQuery) ||
        card.context.toLowerCase().includes(searchQuery) ||
        card.capture.toLowerCase().includes(searchQuery) ||
        card.spark.toLowerCase().includes(searchQuery) ||
        card.question1.toLowerCase().includes(searchQuery) ||
        card.question2.toLowerCase().includes(searchQuery)
      );
    } else if (filteredBuckets) {
      return filteredBuckets;
    }
  });

  const cardElements = filteredCards.map((card) => {
    return (
      <div className="card main-card" key={card.id}>
        <Link to={`/card/${card.id}`}>
          <p>{card.noteTitle}</p>
          <p>{card.bookTitle}</p>
          <p>{card.buckets}</p>
          {card.spark ? (
            <p>{card.spark.slice(0, 300)}</p>
          ) : (
            <p>{card.capture.slice(0, 300)}</p>
          )}
        </Link>
      </div>
    );
  });

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
      <h1>Library</h1>
      <label htmlFor="search-query">Search</label>
      <input
        id="search-query"
        name="search-query"
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />
      {bucketElements}
      {cardElements}
    </>
  );
}
