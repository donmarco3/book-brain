import React from "react";
import { Link, useLoaderData } from "react-router";
import { getSynthesis } from "../api";

export async function loader({ params }) {
  const synthesis = await getSynthesis(params.id);
  return { synthesis: synthesis[0] };
}

export default function Synthesis() {
  const { synthesis } = useLoaderData();
  console.log(synthesis);

  return (
    <>
      <div className="log-header">
        <Link to={`/syntheses/19`} className="link-btn">
          &larr; Back to Syntheses
        </Link>
        <h1>Synthesis</h1>
        {synthesis.synthesis}
      </div>
    </>
  );
}
