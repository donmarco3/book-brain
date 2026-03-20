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
  const [showFilters, setShowFilters] = React.useState(false);
  const { cards, buckets } = useLoaderData();

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }
  }

  function clearFilters() {
    setSelectedBuckets([]);
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
    const bucketElements = card.buckets.map((bucket) => (
      <p key={bucket} className="pill">
        {bucket}
      </p>
    ));

    return (
      <div className="card main-card" key={card.id}>
        <Link to={`/card/${card.id}`} className="link">
          <div className="main-card-header">
            <p className="nice-font card-title">{card.noteTitle}</p>
            <div>
              <p>{card.bookTitle}</p>
              <p>p. {card.page}</p>
            </div>
          </div>

          <div className="main-card-buckets">{bucketElements}</div>

          <div className="main-card-text">
            <p>
              <span className="bold">Context:</span>{" "}
              {card.context.slice(0, 300)}
            </p>
            <p className="italic capture">{card.capture.slice(0, 300)}</p>
            <div className="pill">
              <p>{card.spark.slice(0, 300)}</p>
            </div>
          </div>
        </Link>
      </div>
    );
  });

  const bucketButtonElements = buckets.map((bucket) => {
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
      <div className="library-header">
        <input
          name="search-query"
          placeholder="Search cards..."
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        <div className="filter-container">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-dark"
          >
            Filter
            {selectedBuckets.length > 0 && ` (${selectedBuckets.length})`}
          </button>
          {selectedBuckets.length > 0 && (
            <button onClick={clearFilters}>Clear</button>
          )}
          {showFilters && (
            <div className="filter-dropdown">{bucketButtonElements}</div>
          )}
        </div>
      </div>
      {cards.length > 0 ? (
        cardElements
      ) : (
        <p>
          Your library is empty. Start by adding books and distilling notes.
        </p>
      )}
    </>
  );
}
