import React from "react";
import { deleteBucket, getBuckets } from "../api";
import { useLoaderData, useRevalidator } from "react-router";

export async function loader() {
  const buckets = await getBuckets();
  return { buckets };
}

export default function ManageBuckets() {
  const { buckets } = useLoaderData();
  const revalidator = useRevalidator();

  function handleDeletion(id) {
    deleteBucket(id);
    revalidator.revalidate();
  }

  const bucketElements = buckets.map((bucket) => {
    return (
      <div className="bucket" key={bucket.id}>
        <button className="btn-dark btn-lg">{bucket.name}</button>
        <button
          className="btn btn-lg"
          onClick={() => handleDeletion(bucket.id)}
        >
          Delete
        </button>
      </div>
    );
  });

  return (
    <>
      <h1>Manage Buckets</h1>
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
