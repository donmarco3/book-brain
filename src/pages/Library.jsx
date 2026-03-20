import React from "react";
import { getBooks, getBuckets, getCards } from "../api";
import {
  Link,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "react-router";
import AddBook from "../components/AddBook";

export async function loader() {
  const cards = await getCards();
  const buckets = await getBuckets();
  return { cards, buckets };
}

export default function Library() {
  const { cards, buckets } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const bookParam = searchParams.get("book");
  const initialBooks = bookParam ? [bookParam] : [];

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const [selectedBooks, setSelectedBooks] = React.useState(initialBooks);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }

    const newParams = new URLSearchParams(searchParams);
    if (selectedBuckets.includes(name)) {
      newParams.delete("bucket", name);
    } else {
      newParams.append("bucket", name);
    }
    setSearchParams(newParams);
  }

  function clearFilters() {
    setSelectedBuckets([]);
    setSelectedBooks([]);
    setSearchParams({});
  }

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      searchQuery.toLowerCase() === "" ||
      card.noteTitle.toLowerCase().includes(searchQuery) ||
      card.bookTitle.toLowerCase().includes(searchQuery) ||
      card.context.toLowerCase().includes(searchQuery) ||
      card.capture.toLowerCase().includes(searchQuery) ||
      card.spark.toLowerCase().includes(searchQuery) ||
      card.question1.toLowerCase().includes(searchQuery) ||
      card.question2.toLowerCase().includes(searchQuery);

    const matchesBuckets =
      selectedBuckets.length === 0 ||
      selectedBuckets.every((bucket) => card.buckets.includes(bucket));

    const matchesBooks =
      selectedBooks.length === 0 ||
      selectedBooks.some((book) => card.bookId === book);

    return matchesSearch && matchesBuckets && matchesBooks;
  });

  const cardElements = filteredCards.map((card) => {
    const bucketElements = card.buckets.map((bucket) => (
      <button key={bucket} className="pill">
        {bucket}
      </button>
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
          selectedBuckets.includes(bucket.name) ? "bucket btn-dark" : "bucket"
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
            className="btn-dark btn-lg"
          >
            Filter
            {selectedBuckets.length > 0 && ` (${selectedBuckets.length})`}
          </button>
          {selectedBuckets.length > 0 || selectedBooks.length > 0 ? (
            <button className="btn-lg" onClick={clearFilters}>
              Clear
            </button>
          ) : null}
          {showFilters ? (
            <div className="filter-dropdown">{bucketButtonElements}</div>
          ) : null}
        </div>
      </div>
      {cards.length > 0 ? (
        cardElements
      ) : (
        <div className="no-items-container">
          <p>
            Your library is empty. Start by adding books and distilling notes.
          </p>
          <button
            className="btn-dark btn-lg"
            onClick={() => setShowModal(true)}
          >
            + Add Book
          </button>
          <AddBook
            action={"/bookshelf"}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        </div>
      )}
    </>
  );
}
