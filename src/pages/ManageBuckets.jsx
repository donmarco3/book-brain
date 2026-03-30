import React from "react";
import { deleteBucket, getBuckets } from "../api";
import { Link, useLoaderData, useLocation, useRevalidator } from "react-router";

export async function loader() {
  const buckets = await getBuckets();
  return { buckets };
}

export default function ManageBuckets() {
  const { buckets } = useLoaderData();
  const revalidator = useRevalidator();
  const location = useLocation();

  function handleDeletion(id, bucket) {
    deleteBucket(id, bucket);
    revalidator.revalidate();
  }

  const bucketElements = buckets.map((bucket) => {
    return (
      <div className="bucket" key={bucket.id}>
        <button className="btn-dark btn-lg">{bucket.name}</button>
        <button
          className="btn btn-lg"
          onClick={() => handleDeletion(bucket.id, bucket.name)}
        >
          Delete
        </button>
      </div>
    );
  });

  const pathName = location.state ? location.state.from : "/";

  let pathNameText;
  if (pathName.includes("/card")) {
    pathNameText = "Card";
  } else if (pathName.includes("/distillation")) {
    pathNameText = "Distillation";
  } else {
    pathNameText = "Home";
  }

  return (
    <>
      <div className="log-header">
        <Link to={pathName} className="link-btn">
          &larr; Back to {pathNameText}
        </Link>
        <h1>Manage Buckets</h1>
      </div>
      <div className="bookshelf-header">
        <p className="text-sm">
          {buckets.length > 0
            ? `${buckets.length} buckets`
            : "You have no buckets"}
        </p>
      </div>
      <div className="buckets">{bucketElements}</div>
    </>
  );
}
