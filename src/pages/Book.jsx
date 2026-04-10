import React from "react";
import { getBook } from "../api";
import { Link, useLoaderData } from "react-router";

export async function loader({ params }) {
  const book = await getBook(params.id);
  return { book };
}

export default function Book() {
  const { book } = useLoaderData();

  return (
    <>
      <div className="log-header">
        <Link to={`/bookshelf`} className="link-btn">
          &larr; Back to Bookshelf
        </Link>
        <h1>{book.title}</h1>
      </div>

      <div className="card main-card card-content">
        <div className="main-card-header">
          <p className="nice-font card-title">{book.title}</p>
        </div>
      </div>
    </>
  );
}
