import React from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { getBook, getSyntheses } from "../api";
import { sliceString } from "../utils";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";

  const syntheses = await getSyntheses(params.id, page, sort);
  const book = await getBook(params.id);
  return { syntheses, book };
}

export default function Syntheses() {
  const { syntheses, book } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const creationDate = new Date(book.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const synthesesElements = syntheses.map((synthesis) => {
    return (
      <Link
        to={`/synthesis/${synthesis.id}`}
        state={{ from: `/syntheses/${synthesis.book_id}` }}
        className="link"
        key={synthesis.id}
      >
        <div className="card main-card">
          <div className="main-card-header">
            <p>Synthesis {synthesis.id}</p>
            <p className="text-sm">
              {new Date(synthesis.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <p>{sliceString(synthesis.synthesis)}</p>
        </div>
      </Link>
    );
  });

  return (
    <>
      <div className="log-header">
        <Link to={`/book/${book.id}`} className="link-btn">
          &larr; Back to Book
        </Link>
        <h1>Syntheses</h1>
        <p className="text-sm">
          {book.title} by {book.author}
        </p>
      </div>
      <div className="library-subheader">
        <select onChange={(e) => updateSort(e.target.value)}>
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
        </select>
      </div>
      {syntheses.length > 0 ? (
        synthesesElements
      ) : (
        <div className="no-items-container">
          {currentPage === 1 ? (
            <p>You have no syntheses for this book.</p>
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
          disabled={book.syntheses.length <= currentPage * 5}
        >
          <FaAngleRight />
        </button>
      </div>
    </>
  );
}
