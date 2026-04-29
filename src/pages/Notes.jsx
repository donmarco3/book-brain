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
import Pill from "../components/Pill";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";
  const bookParam = url.searchParams.getAll("book");
  const bucketParam = url.searchParams.getAll("bucket");

  const response = await getNotes(page, sort, bookParam, bucketParam);
  const allNotes = await getAllNotes();
  const buckets = await getBuckets();
  const books = await getAllBooks();
  return {
    notes: response.data,
    count: response.count,
    allNotes,
    buckets,
    books,
    bookParam,
    bucketParam,
  };
}

export default function Notes() {
  const { notes, count, allNotes, buckets, books, bookParam, bucketParam } =
    useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const sidebarRef = React.useRef(null);

  const initialBooks = bookParam ? [bookParam] : [];
  const initialBuckets = bucketParam ? [bucketParam] : [];
  const initialNote = count === 0 ? null : notes[0];

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState(
    initialBuckets[0],
  );
  const [selectedBooks, setSelectedBooks] = React.useState(initialBooks[0]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [bookFilter, setBookFilter] = React.useState(false);
  const [bucketFilter, setBucketFilter] = React.useState(false);
  const [activeNote, setActiveNote] = React.useState(initialNote);

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
    setSearchQuery("");
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery.toLowerCase() === "" ||
      note.note_title.toLowerCase().includes(searchQuery) ||
      note.context.toLowerCase().includes(searchQuery) ||
      note.capture.toLowerCase().includes(searchQuery) ||
      note.spark.toLowerCase().includes(searchQuery);

    return matchesSearch;
  });

  const isFiltered =
    bookParam.length === 0 &&
    bucketParam.length === 0 &&
    searchQuery.length === 0
      ? false
      : true;

  React.useEffect(() => {
    if (isFiltered) {
      setActiveNote(filteredNotes[0]);
    }
  }, [filteredNotes]);

  const noteElements = filteredNotes.map((note) => {
    const book = books.find((book) => book.id === note.book_id);

    if (activeNote) {
      return (
        <div
          key={note.id}
          className={note.id === activeNote.id ? "active-note" : undefined}
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
    } else {
      setActiveNote(notes[0]);
    }
  });

  const bookButtonElements = books.map((book) => {
    return (
      <div key={book.id}>
        <input
          type="checkbox"
          checked={selectedBooks.includes(book.id.toString())}
          readOnly
          id={book}
        />
        <label onClick={() => toggle(null, book.id)} htmlFor={book.id}>
          {book.title}
        </label>
      </div>
    );
  });

  const bucketButtonElements = buckets.map((bucket) => {
    return (
      <div key={bucket}>
        <input
          type="checkbox"
          checked={selectedBuckets.includes(bucket)}
          readOnly
          id={bucket}
        />
        <label onClick={() => toggle(bucket, null)} htmlFor={bucket}>
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
          value={searchQuery}
        />
        {(selectedBuckets.length > 0 ||
          selectedBooks.length > 0 ||
          searchQuery.length > 0) && (
          <button onClick={clearFilters}>Clear</button>
        )}
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
                  <p className="gold">
                    Books{" "}
                    {selectedBooks.length > 0 && `(${selectedBooks.length})`}
                  </p>
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
                  <p className="gold">
                    Buckets{" "}
                    {selectedBuckets.length > 0 &&
                      `(${selectedBuckets.length})`}
                  </p>
                  <p>{!bucketFilter ? <FaPlus /> : <FaMinus />}</p>
                </div>
                {bucketFilter && (
                  <div className="filter-options">{bucketButtonElements}</div>
                )}
              </div>

              <div className="filter-option-container">
                <p className="gold">Sort By</p>
                <div className="filter-options">
                  <input
                    type="checkbox"
                    checked={currentSort === "newest"}
                    id="newest"
                    readOnly
                  />
                  <label onClick={() => updateSort("newest")} htmlFor="newest">
                    Newest
                  </label>
                  <input
                    type="checkbox"
                    checked={currentSort === "oldest"}
                    id="oldest"
                    readOnly
                  />
                  <label onClick={() => updateSort("oldest")} htmlFor="oldest">
                    Oldest
                  </label>
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className={!activeNote ? "notes-col padding-inline" : "notes-col"}>
          {activeNote && (
            <div className="notes-count padding-inline">
              {searchQuery.length > 0
                ? `${filteredNotes.length} notes`
                : `${count} notes`}
            </div>
          )}
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

          {activeNote && (
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
                disabled={noteElements ? noteElements.length !== 5 : true}
              >
                <FaAngleRight />
              </button>
            </div>
          )}
        </div>

        {activeNote && (
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

            <div className="margin-block flex-row">
              {activeNote.buckets.map((bucket) => (
                <Pill key={bucket.id} colour="red">
                  {bucket.name}
                </Pill>
              ))}
            </div>

            <div className="card main-card" key={activeNote.id}>
              <div className="flex-col">
                <p className="italic capture">"{activeNote.capture}"</p>
                <div className="border margin-block"></div>
                <p>{activeNote.spark}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
