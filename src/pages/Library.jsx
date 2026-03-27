import React from "react";
import { getBooks, getBuckets, getCards } from "../api";
import { Link, useLoaderData, useSearchParams } from "react-router";
import AddBook from "../components/AddBook";
import { sliceString } from "../utils";
import useClickOutside from "../components/hooks/useClickOutside";

export async function loader() {
  const cards = await getCards();
  const buckets = await getBuckets();
  const books = await getBooks();
  return { cards, buckets, books };
}

export default function Library() {
  const { cards, buckets, books } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const sidebarRef = React.useRef(null);

  const bookParam = searchParams.getAll("book");
  const initialBooks = bookParam ? [bookParam] : [];
  const bucketParam = searchParams.getAll("bucket");
  const initialBuckets = bucketParam ? [bucketParam] : [];

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState(
    initialBuckets[0],
  );
  const [selectedBooks, setSelectedBooks] = React.useState(initialBooks[0]);
  const [selectedValue, setSelectedValue] = React.useState("newest");
  const [showFilters, setShowFilters] = React.useState(false);
  const [bookFilter, setBookFilter] = React.useState(false);
  const [bucketFilter, setBucketFilter] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  useClickOutside(sidebarRef, () => setShowFilters(false));

  function toggle(bucketName, bookId) {
    const newParams = new URLSearchParams(searchParams);

    if (!bookId) {
      if (selectedBuckets.includes(bucketName)) {
        setSelectedBuckets(
          selectedBuckets.filter((bucket) => bucket !== bucketName),
        );
        newParams.delete("bucket", bucketName);
      } else {
        setSelectedBuckets([...selectedBuckets, bucketName]);
        newParams.append("bucket", bucketName);
      }
    }

    if (!bucketName) {
      if (selectedBooks.includes(bookId)) {
        setSelectedBooks(selectedBooks.filter((book) => book !== bookId));
        newParams.delete("book", bookId);
      } else {
        setSelectedBooks([...selectedBooks, bookId]);
        newParams.append("book", bookId);
      }
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
      card.bookId.toLowerCase().includes(searchQuery) ||
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

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (selectedValue === "newest") {
      return b.createdAt.seconds - a.createdAt.seconds;
    } else if (selectedValue === "oldest") {
      return a.createdAt.seconds - b.createdAt.seconds;
    }
  });

  const cardElements = sortedCards.map((card) => {
    const bucketElements = card.buckets.map((bucket) => {
      if (buckets.some((item) => item.name === bucket))
        return (
          <p key={bucket} className="pill">
            {bucket}
          </p>
        );
    });

    return (
      <div className="card main-card" key={card.id}>
        <Link
          to={`/card/${card.id}`}
          state={{ from: "/library", search: `?${searchParams.toString()}` }}
          className="link"
        >
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
              <span className="bold">Context:</span> {sliceString(card.context)}
            </p>
            <p className="italic capture">{sliceString(card.capture)}</p>
            <div className="pill">
              <p>{sliceString(card.spark)}</p>
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
          selectedBuckets.includes(bucket.name)
            ? "filter-item-btn"
            : "filter-item-btn btn-dark"
        }
        key={bucket.id}
        onClick={() => toggle(bucket.name, null)}
      >
        {bucket.name}
      </button>
    );
  });

  const bookButtonElements = books.map((book) => {
    return (
      <button
        className={
          selectedBooks.includes(book.id)
            ? "filter-item-btn"
            : "filter-item-btn btn-dark"
        }
        key={book.id}
        onClick={() => toggle(null, book.id)}
      >
        {book.title}
      </button>
    );
  });

  return (
    <>
      <aside
        ref={sidebarRef}
        className="sidebar"
        style={{
          transform: showFilters ? "translateX(0)" : "translateX(-100%",
        }}
      >
        <div className="sidebar-header">
          <h2>Filter</h2>
          <button onClick={() => setShowFilters((prev) => !prev)}>X</button>
        </div>

        <div className="filter-option-container">
          <div
            className="filter-option"
            onClick={() => setBookFilter((prev) => !prev)}
          >
            <p>Books</p>
            <p>{!bookFilter ? "+" : "-"}</p>
          </div>
          {bookFilter && (
            <div className="filter-options">{bookButtonElements}</div>
          )}
        </div>

        <div className="filter-option-container">
          <div
            className="filter-option"
            onClick={() => setBucketFilter((prev) => !prev)}
          >
            <p>Buckets</p>
            <p>{!bucketFilter ? "+" : "-"}</p>
          </div>
          {bucketFilter && (
            <div className="filter-options">{bucketButtonElements}</div>
          )}
        </div>
      </aside>

      <h1>Library</h1>
      <p className="text-sm">{cardElements.length} cards</p>
      <div className="library-header">
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
        </div>
      </div>

      <div className="library-subheader">
        <input
          name="search-query"
          placeholder="Search cards..."
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <select
          className="btn-lg"
          onChange={(e) => setSelectedValue(e.target.value)}
        >
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
        </select>
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
