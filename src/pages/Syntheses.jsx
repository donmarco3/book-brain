import React from "react";
import { Link, useLoaderData } from "react-router";
import { getBook, getSyntheses } from "../api";
import { sliceString } from "../utils";

export async function loader({ params }) {
  const syntheses = await getSyntheses(params.id);
  const book = await getBook(params.id);
  return { syntheses, book };
}

export default function Syntheses() {
  const { syntheses, book } = useLoaderData();

  const [selectedValue, setSelectedValue] = React.useState("newest");

  const sortedSyntheses = [...syntheses].sort((a, b) => {
    if (selectedValue === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (selectedValue === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return;
  });

  const creationDate = new Date(book.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const synthesesElements = sortedSyntheses.map((synthesis) => {
    return (
      <Link
        to={`/synthesis/${synthesis.id}`}
        state={{ from: `/syntheses/${synthesis.book_id}` }}
        className="link"
        key={synthesis.id}
      >
        <div className="card main-card">
          <div className="main-card-header">
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
        <select className="" onChange={(e) => setSelectedValue(e.target.value)}>
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
        </select>
      </div>
      {syntheses.length > 0 ? (
        synthesesElements
      ) : (
        <div className="no-items-container">
          <p>You have no syntheses for this book.</p>
        </div>
      )}
    </>
  );
}
