import React from "react";
import {
  useLoaderData,
  useRevalidator,
  Link,
  useSearchParams,
} from "react-router-dom";
import { getBooks, deleteBook, updateBookStatus, getAllBooks } from "../api";
import AddBook from "../components/AddBook";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";

  const books = await getBooks(page, sort);
  const allBooks = await getAllBooks();
  return { books, allBooks };
}

export default function Library() {
  const { books, allBooks } = useLoaderData();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showModal, setShowModal] = React.useState(false);

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

  function handleDeletion(id) {
    if (
      window.confirm(
        "Are you sure you want to delete this book? Deleting this book will also delete any associated notes. Do you wish to continue?",
      )
    ) {
      deleteBook(id).then(() => revalidator.revalidate());
    }
  }

  function changeBookStatus(id, currentStatus) {
    updateBookStatus(id, currentStatus).then(() => revalidator.revalidate());
  }

  const bookElements = books.map((book) => {
    return (
      <div className="card book-card" key={book.id}>
        <div className="book-card-header">
          <p className="nice-font card-title">{book.title}</p>
          <p className={book.status === "finished" ? "pill success" : "pill"}>
            {book.status === "finished" ? "Finished" : "Reading"}
          </p>
        </div>
        <p className="text-sm">by {book.author}</p>
        <div className="book-card-links">
          <Link
            className="link-btn link-btn-dark"
            to={`/book/${book.id}/log`}
            state={{ from: "/library" }}
          >
            Log Note
          </Link>
          <Link className="link-btn" to={`/library?book=${book.id}`}>
            View Notes ({book.notes.length})
          </Link>
        </div>
        <div className="note-buttons book-buttons">
          <button onClick={() => changeBookStatus(book.id, book.status)}>
            Mark as {book.status === "reading" ? "Finished" : "Reading"}
          </button>
          <div>
            <Link
              to={`/book/${book.id}`}
              state={{ from: "/library" }}
              className="link link-btn"
            >
              Edit Book
            </Link>
            <button
              className="btn-delete"
              onClick={() => handleDeletion(book.id)}
            >
              Delete Book
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <>
      <h1>Library</h1>
      <div className="bookshelf-header">
        <p className="text-sm">
          {allBooks.length} {allBooks.length === 1 ? "book" : "books"}
        </p>
        <button className="btn-dark" onClick={() => setShowModal(true)}>
          + Add Book
        </button>
      </div>
      <AddBook
        action={"/library"}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      {books.length > 0 ? (
        <div className="books-list">{bookElements}</div>
      ) : (
        <div className="no-items-container">
          {currentPage === 1 ? (
            <p>You have no books. Click add book to add your first.</p>
          ) : null}
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
          disabled={allBooks.length <= currentPage * 5}
        >
          <FaAngleRight />
        </button>
      </div>
    </>
  );
}
