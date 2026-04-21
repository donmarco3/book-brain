import React from "react";
import { Link, useLoaderData } from "react-router";
import { getSynthesis } from "../api";

export async function loader({ params }) {
  const synthesis = await getSynthesis(params.id);
  return { synthesis: synthesis[0] };
}

export default function Synthesis() {
  const { synthesis } = useLoaderData();

  return (
    <>
      <div className="log-header">
        <Link to={`/syntheses/19`} className="link-btn">
          &larr; Back to Syntheses
        </Link>
        <h1>Synthesis</h1>
      </div>
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
        <p>{synthesis.synthesis}</p>
      </div>
    </>
  );
}
