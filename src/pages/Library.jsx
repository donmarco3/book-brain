import React from "react";
import { getAllBooks, getBuckets, getAllCards, getCards } from "../api";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { sliceString } from "../utils";
import useClickOutside from "../components/hooks/useClickOutside";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";

  const cards = await getCards(page, sort);
  const allCards = await getAllCards();
  const buckets = await getBuckets();
  const books = await getAllBooks();
  return { cards, allCards, buckets, books };
}

export default function Library() {
  const { cards, allCards, buckets, books } = useLoaderData();
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

  useClickOutside(sidebarRef, () => setShowFilters(false));

  const defaultPage = searchParams.get("page") ?? "1";
  const currentPage = Number(defaultPage);
  const currentSort = searchParams.get("sort") ?? "newest";

  function updatePage(type) {
    if (type === "right") {
      setSearchParams({
        page: currentPage + 1,
        sort: currentSort,
      });
    } else {
      setSearchParams({
        page: currentPage - 1 === 0 ? 1 : currentPage - 1,
        sort: currentSort,
      });
    }
  }

  function updateSort(type) {
    if (type === "newest") {
      setSearchParams({ page: 1, sort: "newest" });
    } else {
      setSearchParams({ page: 1, sort: "oldest" });
    }
  }

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
      if (selectedBooks.includes(bookId.toString())) {
        setSelectedBooks(
          selectedBooks.filter((book) => book !== bookId.toString()),
        );
        newParams.delete("book", bookId);
      } else {
        setSelectedBooks([...selectedBooks, bookId.toString()]);
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
      card.card_title.toLowerCase().includes(searchQuery) ||
      card.context.toLowerCase().includes(searchQuery) ||
      card.capture.toLowerCase().includes(searchQuery) ||
      card.spark.toLowerCase().includes(searchQuery) ||
      card.question1.toLowerCase().includes(searchQuery) ||
      card.question2.toLowerCase().includes(searchQuery);

    const cardBuckets = card.buckets.map((bucket) => bucket.name);
    const matchesBuckets =
      selectedBuckets.length === 0 ||
      selectedBuckets.some((bucket) => cardBuckets.includes(bucket));

    const matchesBooks =
      selectedBooks.length === 0 ||
      selectedBooks.some((book) => card.book_id.toString() === book);

    return matchesSearch && matchesBuckets && matchesBooks;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (selectedValue === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (selectedValue === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return;
  });

  const cardElements = sortedCards.map((card) => {
    const book = books.find((book) => book.id === card.book_id);

    const bucketElements = card.buckets.map((bucket) => (
      <p key={bucket.id} className="pill">
        {bucket.name}
      </p>
    ));

    return (
      <Link
        to={`/card/${card.id}`}
        state={{ from: "/library", search: `?${searchParams.toString()}` }}
        className="link"
        key={card.id}
      >
        <div className="card main-card">
          <div className="main-card-header">
            <p className="nice-font card-title">{card.card_title}</p>
            <div>
              <p>{book.title}</p>
              <p>p. {card.page}</p>
            </div>
          </div>

          <div className="main-card-buckets">{bucketElements}</div>

          <div className="main-card-text">
            {card.context && (
              <p>
                <span className="bold">Context:</span>{" "}
                {sliceString(card.context)}
              </p>
            )}
            <p className="italic capture">{sliceString(card.capture)}</p>
            <div className="pill">
              <p>{sliceString(card.spark)}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  });

  const bucketButtonElements = buckets.map((bucket) => {
    return (
      <button
        className={
          selectedBuckets.includes(bucket)
            ? "filter-item-btn"
            : "filter-item-btn btn-dark"
        }
        key={bucket}
        onClick={() => toggle(bucket, null)}
      >
        {bucket}
      </button>
    );
  });

  const bookButtonElements = books.map((book) => {
    return (
      <button
        className={
          selectedBooks.includes(book.id.toString())
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
      <p className="text-sm">
        {cardElements.length} {cardElements.length === 1 ? "card" : "cards"}
      </p>
      <div className="library-header">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-dark "
        >
          Filter
        </button>
        {selectedBuckets.length > 0 || selectedBooks.length > 0 ? (
          <button onClick={clearFilters}>Clear</button>
        ) : null}
      </div>

      <div className="library-subheader">
        <input
          name="search-query"
          placeholder="Search cards..."
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <select onChange={(e) => setSelectedValue(e.target.value)}>
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
        </div>
      )}
      <div className="pagination">
        <button
          className="btn-transparent"
          onClick={() => updatePage("left")}
          disabled={currentPage === 1}
        >
          <FaAngleLeft />
        </button>
        <p>Page {currentPage}</p>
        <button
          className="btn-transparent"
          onClick={() => updatePage("right")}
          disabled={allCards.length <= currentPage * 5}
        >
          <FaAngleRight />
        </button>
      </div>
    </>
  );
}
