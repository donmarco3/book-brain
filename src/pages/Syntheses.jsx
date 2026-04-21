import React from "react";
import { Link, useLoaderData } from "react-router";
import { getSyntheses } from "../api";
import { sliceString } from "../utils";

export async function loader({ params }) {
  const syntheses = await getSyntheses(params.id);
  return { syntheses };
}

export default function Syntheses() {
  const { syntheses } = useLoaderData();
  console.log(syntheses);

  const synthesesElements = syntheses.map((synthesis) => {
    return (
      <Link
        to={`/synthesis/${synthesis.id}`}
        state={{ from: `/syntheses/${synthesis.book_id}` }}
        className="link"
        key={synthesis.id}
      >
        <div className="card main-card">
          <p>{sliceString(synthesis.synthesis)}</p>
        </div>
      </Link>
    );
  });

  return (
    <>
      <div className="log-header">
        <Link to={`/book/`} className="link-btn">
          &larr; Back to Book
        </Link>
        <h1>Syntheses</h1>
        {synthesesElements}
      </div>
    </>
  );
}
