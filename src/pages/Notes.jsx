import React from "react";
import {
  deleteNoteBucket,
  getAllBooks,
  getAllNotes,
  getBuckets,
  getNotes,
  updateNote,
} from "../api";
import {
  Link,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router";
import { getDaysAgo, sliceString, validatePageRange } from "../utils";
import useClickOutside from "../components/hooks/useClickOutside";
import { FaBookOpen, FaFilter } from "react-icons/fa";
import Pill from "../components/Pill";
import { SizeContext } from "../components/Layout";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";
  const bookParam = url.searchParams.getAll("book");
  const bucketParam = url.searchParams.getAll("bucket");

  const response = await getNotes(page, sort, bookParam, bucketParam);
  const allNotes = await getAllNotes();
  const { buckets } = await getBuckets();
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
  const addBucketRef = React.useRef(null);
  const size = React.useContext(SizeContext);
  const revalidator = useRevalidator();

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
  const [isClicked, setIsClicked] = React.useState(false);

  const activeNoteBuckets = activeNote?.buckets.map((bucket) => bucket.name);

  const [isEditing, setIsEditing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [bucketErrorMessage, setBucketErrorMessage] = React.useState("");
  const [noteTitle, setNoteTitle] =
    React.useState(activeNote?.note_title) || "";
  const [page, setPage] = React.useState(activeNote?.page || null);
  const [context, setContext] = React.useState(activeNote?.context || "");
  const [capture, setCapture] = React.useState(activeNote?.capture || "");
  const [spark, setSpark] = React.useState(activeNote?.spark || "");
  const [userBucket, setUserBucket] = React.useState("");
  const [allBuckets, setAllBuckets] = React.useState(buckets);
  const [selectedNoteBuckets, setSelectedNoteBuckets] =
    React.useState(activeNoteBuckets);
  const [showBucketInput, setShowBucketInput] = React.useState(false);

  useClickOutside(sidebarRef, () => setShowFilters(false));
  useClickOutside(addBucketRef, () => updateSelectedNoteBuckets());

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
    setIsEditing(false);
    setIsClicked(false);
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
    setIsEditing(false);
    setIsClicked(false);
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
    setIsEditing(false);
    setIsClicked(false);
  }

  function handleClick() {
    if (isEditing) {
      if (!noteTitle) {
        setErrorMessage("Title is required");
        return;
      }
      if (!page) {
        setErrorMessage("Page is required");
        return;
      }
      if (!context && !capture && !spark) {
        setErrorMessage(
          "At least one of context, capture, or spark is required",
        );
        return;
      }
      if (selectedNoteBuckets.length === 0 && isEditing) {
        setErrorMessage("At least one bucket is required");
        return;
      }

      activeNote.buckets.map((bucket) => {
        if (!selectedNoteBuckets.includes(bucket.name)) {
          deleteNoteBucket(bucket.name);
        }
      });

      validatePageRange(page);
      updateNote(
        activeNote.id,
        noteTitle,
        page,
        context,
        capture,
        spark,
        selectedNoteBuckets,
      ).then(() => revalidator.revalidate());
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setIsClicked(false);
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteCard(card.id);
      revalidator.revalidate();
    }
  }

  function updateUserBucket(event) {
    setUserBucket(event.currentTarget.value);
  }

  function updateSelectedNoteBuckets() {
    if (userBucket !== "") {
      setAllBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setSelectedNoteBuckets((prevBuckets) => [...prevBuckets, userBucket]);
      setUserBucket("");
      setShowBucketInput(false);
      setBucketErrorMessage("");
      revalidator.revalidate();
    } else {
      setBucketErrorMessage("Bucket must have a name");
    }
  }

  function toggleBucket(name) {
    if (selectedNoteBuckets.includes(name)) {
      setSelectedNoteBuckets(
        selectedNoteBuckets.filter((bucket) => bucket !== name),
      );
    } else {
      setSelectedNoteBuckets([...selectedNoteBuckets, name]);
    }
  }

  React.useEffect(() => {
    if (addBucketRef.current) {
      addBucketRef.current.focus();
    }
  }, [showBucketInput]);

  function clearFilters() {
    setSelectedBuckets([]);
    setSelectedBooks([]);
    setSearchParams({});
    setSearchQuery("");
    setActiveNote(initialNote);
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

  React.useEffect(() => {
    if (!isClicked) {
      setActiveNote(filteredNotes[0]);
    }
  }, [filteredNotes]);

  const noteElements = filteredNotes.map((note) => {
    const book = books.find((book) => book.id === note.book_id);

    if (activeNote) {
      return (
        <>
          {size === "small" ? (
            <Link to={`/notes/${note.id}`} key={note.id}>
              <div>
                <p className="gold">{book.title}</p>
                <h3>{note.note_title}</h3>
                <p className="italic capture">{sliceString(note.capture)}</p>
                <p>
                  {getDaysAgo(note.created_at)} &middot; p. {note.page}
                </p>
              </div>
            </Link>
          ) : (
            <div
              key={note.id}
              className={note.id === activeNote.id ? "active-note" : ""}
              onClick={() => {
                setActiveNote(note);
                setIsEditing(false);
                setIsClicked(true);
              }}
            >
              <p className="gold">{book.title}</p>
              <h3>{note.note_title}</h3>
              <p className="italic capture">{sliceString(note.capture)}</p>
              <p>
                {getDaysAgo(note.created_at)} &middot; p. {note.page}
              </p>
            </div>
          )}
        </>
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

  const noteButtons = (
    <div className="note-buttons">
      <button onClick={handleClick}>{isEditing ? "Save" : "Edit"}</button>
      {isEditing ? (
        <button
          onClick={() => {
            setIsEditing(false);
            setShowBucketInput(false);
            setBucketErrorMessage("");
          }}
        >
          Cancel
        </button>
      ) : null}
      {!isEditing ? (
        <button onClick={handleDeletion} className="btn-red">
          Delete
        </button>
      ) : null}
    </div>
  );

  const allBucketElements = allBuckets.map((bucket) => {
    return (
      <Pill
        colour={selectedNoteBuckets.includes(bucket) ? "gold" : "std"}
        border="border"
        key={bucket}
        onClick={() => toggleBucket(bucket)}
      >
        {bucket}
      </Pill>
    );
  });

  return (
    <>
      <div
        className={
          size === "small"
            ? "page-heading margin-inline-sm align-center space-between"
            : "page-heading margin-inline align-center space-between"
        }
      >
        <h1>Notes</h1>
        <Link
          to={"/log"}
          state={{ from: "/notes", book: null }}
          className="link-btn"
        >
          Log Note
        </Link>
      </div>

      <div
        className={
          size === "small"
            ? "notes-header padding-inline-sm"
            : "notes-header padding-inline"
        }
      >
        <input
          name="search-query"
          placeholder="Search notes..."
          onChange={(e) => {
            setSearchQuery(e.currentTarget.value);
            setIsEditing(false);
            setIsClicked(false);
          }}
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
                <button onClick={() => setShowFilters(false)}>&times;</button>
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
                  <p>{!bookFilter ? <span>&#43;</span> : <span>&#45;</span>}</p>
                </div>
                {bookFilter && (
                  <div className="filter-options padding-block-sm">
                    {bookButtonElements}
                  </div>
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
                  <p>
                    {!bucketFilter ? <span>&#43;</span> : <span>&#45;</span>}
                  </p>
                </div>
                {bucketFilter && (
                  <div className="filter-options padding-block-sm">
                    {bucketButtonElements}
                  </div>
                )}
              </div>

              <div className="filter-option-container">
                <p className="gold">Sort By</p>
                <div className="filter-options padding-block-sm">
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
                &larr;
              </button>
              <p>Page {currentPage}</p>
              <button
                className="btn-transparent"
                onClick={() => updatePage("right")}
                disabled={noteElements ? noteElements.length !== 5 : true}
              >
                &rarr;
              </button>
            </div>
          )}
        </div>

        {activeNote && size === "large" && (
          <>
            <div className="padding-inline notes-col">
              <div className="heading">
                <div className="icon-pill gold">
                  <FaBookOpen />
                  <p>{activeNote.books.title}</p>
                </div>
                <h3>{activeNote.note_title}</h3>
                <p>
                  p. {activeNote.page} &middot; logged on {""}
                  {new Date(activeNote.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                </p>
              </div>
              {!isEditing ? (
                <>
                  <div className="margin-block flex-row">
                    {activeNote.buckets.map((bucket) => (
                      <Pill key={bucket.id} colour="gold">
                        {bucket.name}
                      </Pill>
                    ))}
                  </div>

                  <div className="card main-card" key={activeNote.id}>
                    <div className="flex-col">
                      {activeNote.context && (
                        <>
                          <p>{activeNote.context}</p>
                          <div className="border margin-block"></div>
                        </>
                      )}
                      <p className="italic capture">"{activeNote.capture}"</p>
                      {activeNote.spark && (
                        <>
                          <div className="border margin-block"></div>
                          <p>{activeNote.spark}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {noteButtons}
                </>
              ) : (
                <div className="form">
                  {errorMessage && <p className="red">{errorMessage}</p>}
                  <div>
                    <label htmlFor="note-title" className="gold">
                      Note Title
                    </label>
                    <input
                      id="note-title"
                      defaultValue={activeNote.note_title}
                      onChange={(e) => setNoteTitle(e.currentTarget.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="page" className="gold">
                      Page
                    </label>
                    <input
                      id="page"
                      defaultValue={activeNote.page}
                      onChange={(e) => setPage(e.currentTarget.value)}
                    />
                  </div>
                  <label htmlFor="context" className="gold">
                    Context
                  </label>
                  <textarea
                    id="context"
                    defaultValue={activeNote.context}
                    onChange={(e) => setContext(e.currentTarget.value)}
                  ></textarea>
                  <label htmlFor="capture" className="gold">
                    Capture (passage from the book){" "}
                  </label>
                  <textarea
                    id="capture"
                    defaultValue={activeNote.capture}
                    onChange={(e) => setCapture(e.currentTarget.value)}
                  ></textarea>
                  <label htmlFor="spark" className="gold">
                    Spark (your thought/reaction){" "}
                  </label>
                  <textarea
                    id="spark"
                    defaultValue={activeNote.spark}
                    onChange={(e) => setSpark(e.currentTarget.value)}
                  ></textarea>

                  <div className="buckets">
                    <div className="buckets-header">
                      <p className="gold">Buckets</p>
                    </div>

                    <div className="bucket-buttons">{allBucketElements}</div>
                    <div className="add-bucket">
                      {!showBucketInput ? (
                        <Pill
                          colour="std"
                          className="icon-pill"
                          border="border"
                          onClick={() => setShowBucketInput(true)}
                        >
                          &#43; New bucket
                        </Pill>
                      ) : (
                        <input
                          ref={addBucketRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateSelectedNoteBuckets();
                            }
                          }}
                          onChange={updateUserBucket}
                          placeholder="Bucket name..."
                          value={userBucket}
                        />
                      )}
                    </div>
                    {bucketErrorMessage && (
                      <p className="red">{bucketErrorMessage}</p>
                    )}
                  </div>
                  {noteButtons}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
