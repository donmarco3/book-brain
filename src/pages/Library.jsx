import React from "react";
import { useLoaderData, Link, useSearchParams } from "react-router-dom";
import { getBooks, getAllBooks } from "../api";
import AddBook from "../components/AddBook";
import { FaAngleLeft, FaAngleRight, FaPenNib, FaPlus } from "react-icons/fa";
import Pill from "../components/Pill";
import ProgressBar from "../components/ProgressBar";
import { calculateProgress } from "../utils";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";

  // const books = await getBooks(page, sort);
  const allBooks = await getAllBooks();
  return { allBooks };
}

export default function Library() {
  const { allBooks } = useLoaderData();

  const [showModal, setShowModal] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("all");

  const booksObject = Object.groupBy(allBooks, ({ status }) => status);

  const readingBookElements = booksObject.reading.map((book) => {
    return (
      <>
        <Link
          to={`/library/book/${book.id}`}
          state={{ from: "/library" }}
          className="link"
          key={book.id}
        >
          <div className="card book">
            <div className="book-image">
              <p>{book.title}</p>
            </div>

            <div className="book-info">
              <div className="container-sm">
                <h3>{book.title}</h3>
                <p>{book.author}</p>
              </div>

              <div className="container-sm flex-col">
                <Pill colour="red">
                  {book.status === "read" ? "Read" : "Reading"}
                </Pill>
                <ProgressBar
                  progress={calculateProgress(book.progress, book.pages)}
                />
                <Pill colour="gold">
                  <div className="icon-pill">
                    <FaPenNib />
                    {book.notes.length} notes
                  </div>
                </Pill>
              </div>
            </div>
          </div>
        </Link>
      </>
    );
  });

  const readBookElements = booksObject.read.map((book) => {
    return (
      <>
        <Link
          to={`/book/${book.id}`}
          state={{ from: "/library" }}
          className="link"
          key={book.id}
        >
          <div className="card book">
            <div className="book-image">
              <p>{book.title}</p>
            </div>

            <div className="book-info">
              <div className="container-sm">
                <h3>{book.title}</h3>
                <p>{book.author}</p>
              </div>

              <div className="container-sm flex-row">
                <Pill colour="brown">
                  {book.status === "read" ? "Read" : "Reading"}
                </Pill>
                <Pill colour="gold">
                  <div className="icon-pill">
                    <FaPenNib />
                    {book.notes.length} notes
                  </div>
                </Pill>
              </div>
            </div>
          </div>
        </Link>
      </>
    );
  });

  return (
    <div className="margin-inline">
      <div className="page-heading space-between">
        <h1>Library</h1>
        <button onClick={() => setShowModal(true)}>
          <div className="icon-pill">
            <FaPlus /> Add Book
          </div>
        </button>
        <AddBook
          action={"/library"}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </div>

      <div className="container book-filters flex-row">
        <h3>Filter:</h3>
        <button
          className={selectedValue === "all" && "selected"}
          type="button"
          name="filter"
          value="all"
          onClick={(e) => setSelectedValue(e.currentTarget.value)}
        >
          All ({allBooks.length})
        </button>
        <button
          className={selectedValue === "reading" && "selected"}
          type="button"
          name="filter"
          value="reading"
          onClick={(e) => setSelectedValue(e.currentTarget.value)}
        >
          Reading ({readingBookElements.length})
        </button>
        <button
          className={selectedValue === "read" && "selected"}
          type="button"
          name="filter"
          value="read"
          onClick={(e) => setSelectedValue(e.currentTarget.value)}
        >
          Read ({readBookElements.length})
        </button>
      </div>

      {allBooks.length > 0 ? (
        <>
          {(selectedValue === "all" || selectedValue === "reading") && (
            <div className="container">
              <h2>Currently Reading</h2>
              <div className="books">{readingBookElements}</div>
            </div>
          )}

          {(selectedValue === "all" || selectedValue === "read") && (
            <div className="container">
              <h2>Read</h2>
              <div className="books">{readBookElements}</div>
            </div>
          )}
        </>
      ) : (
        <div className="no-items-container">
          {currentPage === 1 ? (
            <p>You have no books. Click add book to add your first.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
