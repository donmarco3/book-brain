import React from "react";
import { getAllBooks, getAllNotes, getBuckets, getNotes } from "../api";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { sliceString } from "../utils";
import useClickOutside from "../components/hooks/useClickOutside";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBookOpen,
  FaFilter,
  FaMinus,
  FaPenNib,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";
  const bookFilter = url.searchParams.getAll("book");
  const bucketFilter = url.searchParams.getAll("bucket");

  const response = await getNotes(page, sort, bookFilter, bucketFilter);
  const allNotes = await getAllNotes();
  const buckets = await getBuckets();
  const books = await getAllBooks();
  return {
    notes: response.data,
    count: response.count,
    allNotes,
    buckets,
    books,
  };
}

export default function Notes() {
  const { notes, count, allNotes, buckets, books } = useLoaderData();
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
  const [showFilters, setShowFilters] = React.useState(true);
  const [bookFilter, setBookFilter] = React.useState(false);
  const [bucketFilter, setBucketFilter] = React.useState(false);
  const [activeNote, setActiveNote] = React.useState(notes[0]);

  console.log(activeNote);

  useClickOutside(sidebarRef, () => setShowFilters(false));

  const defaultPage = searchParams.get("page") ?? "1";
  const currentPage = Number(defaultPage);
  const currentSort = searchParams.get("sort") ?? "newest";

  function updatePage(type) {
    if (type === "right") {
      setSearchParams((prevParams) => {
        prevParams.set("page", currentPage + 1);
        return prevParams;
      });
    } else {
      setSearchParams((prevParams) => {
        prevParams.set("page", currentPage - 1 === 0 ? 1 : currentPage - 1);
        return prevParams;
      });
    }
  }

  function updateSort(type) {
    if (type === "newest") {
      setSearchParams((prevParams) => {
        prevParams.set("sort", "newest");
        return prevParams;
      });
    } else {
      setSearchParams((prevParams) => {
        prevParams.set("sort", "oldest");
        return prevParams;
      });
    }
  }

  const isFiltered =
    searchParams.getAll("book").length === 0 &&
    searchParams.getAll("bucket").length === 0
      ? false
      : true;

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

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery.toLowerCase() === "" ||
      note.note_title.toLowerCase().includes(searchQuery) ||
      note.context.toLowerCase().includes(searchQuery) ||
      note.capture.toLowerCase().includes(searchQuery) ||
      note.spark.toLowerCase().includes(searchQuery) ||
      note.question1.toLowerCase().includes(searchQuery) ||
      note.question2.toLowerCase().includes(searchQuery);

    return matchesSearch;
  });

  const noteElements = filteredNotes.map((note) => {
    const book = books.find((book) => book.id === note.book_id);

    const bucketElements = note.buckets.map((bucket) => (
      <p key={bucket.id} className="pill">
        {bucket.name}
      </p>
    ));

    if (note.id === activeNote.id) {
      console.log("active note");
    }

    return (
      <div
        key={note.id}
        className={note.id === activeNote.id && "active-note"}
        onClick={() => setActiveNote(note)}
      >
        <p className="gold">{book.title}</p>
        <h3>{note.note_title}</h3>
        <p className="italic capture">{sliceString(note.capture)}</p>
        <p>
          {new Date(note.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &middot; p. {note.page}
        </p>
      </div>
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

  const bucketButtonElements = buckets.map((bucket) => {
    return (
      <div key={bucket} className="filter-item flex-row">
        <input id={bucket} type="checkbox" />
        <label
          onClick={() => toggle(bucket, null)}
          className={selectedBuckets.includes(bucket) ? "" : ""}
          htmlFor={bucket}
        >
          {bucket}
        </label>
      </div>
    );
  });

  return (
    <>
      <div className="page-heading margin-inline">
        <h1>Notes</h1>
      </div>

      <div className="notes-header padding-inline">
        <input
          name="search-query"
          placeholder="Search notes..."
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        {selectedBuckets.length > 0 || selectedBooks.length > 0 ? (
          <button onClick={clearFilters}>Clear</button>
        ) : null}
        <button onClick={() => setShowFilters(true)}>
          <div className="icon-pill">
            <FaFilter />
            <p>Filter</p>
          </div>
        </button>
      </div>

      <div className="flex-row notes-container">
        {showFilters && (
          <div className="modal-overlay">
            <aside ref={sidebarRef}>
              <div className="heading">
                <h2>Filter Notes</h2>
                <button onClick={() => setShowFilters(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="filter-option-container">
                <div
                  className="filter-option"
                  onClick={() => setBookFilter((prev) => !prev)}
                >
                  <p className="gold">Books</p>
                  <p>{!bookFilter ? <FaPlus /> : <FaMinus />}</p>
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
                  <p className="gold">Buckets</p>
                  <p>{!bucketFilter ? <FaPlus /> : <FaMinus />}</p>
                </div>
                {bucketFilter && (
                  <div className="filter-options">{bucketButtonElements}</div>
                )}
              </div>

              <select onChange={(e) => updateSort(e.target.value)}>
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
              </select>
            </aside>
          </div>
        )}

        <div className="notes-col">
          <div className="notes-count padding-inline">{count} notes</div>
          {count > 0 ? (
            <div className="notes">{noteElements}</div>
          ) : (
            <div className="no-items-container">
              <p>
                {allNotes.length === 0
                  ? "You have no notes."
                  : "You have no notes that match the filters."}
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
              disabled={noteElements.length !== 5}
            >
              <FaAngleRight />
            </button>
          </div>
        </div>

        <div className="padding-inline notes-col">
          <div className="heading">
            <div className="icon-pill gold">
              <FaBookOpen />
              <p>{activeNote.books.title}</p>
            </div>
            <h3>{activeNote.note_title}</h3>
            <p>
              {new Date(activeNote.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              &middot; p. {activeNote.page}
            </p>
          </div>

          <div className="card main-card" key={activeNote.id}>
            <div className="flex-col">
              <p className="italic capture">"{activeNote.capture}"</p>
              <div className="border margin-block"></div>
              <p>{activeNote.spark}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
