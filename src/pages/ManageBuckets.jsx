import React from "react";
import { deleteBucket, getBuckets } from "../api";
import { Link, useLoaderData, useLocation, useRevalidator } from "react-router";
import Pill from "../components/Pill";

export async function loader() {
  const buckets = await getBuckets();
  return { buckets };
}

export default function ManageBuckets() {
  const { buckets } = useLoaderData();
  const revalidator = useRevalidator();
  const location = useLocation();

  function handleDeletion(bucket) {
    if (
      window.confirm(
        "Are you sure you want to delete this bucket? This will remove it from all cards. Do you wish to continue?",
      )
    ) {
      deleteBucket(bucket);
      revalidator.revalidate();
    }
  }

  const bucketElements = buckets.map((bucket) => {
    return (
      <div className="bucket" key={bucket}>
        <Pill colour="gold">{bucket}</Pill>
        <button className="btn-delete" onClick={() => handleDeletion(bucket)}>
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
    <div className="margin-inline">
      <div className="page-heading">
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
    </div>
  );
}
