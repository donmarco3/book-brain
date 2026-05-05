import React from "react";
import { addBucket, deleteBucket, getBuckets, updateBucket } from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";
import Pill from "../components/Pill";

export async function loader() {
  const buckets = await getBuckets();
  return { buckets };
}

export default function ManageBuckets() {
  const { buckets } = useLoaderData();
  const revalidator = useRevalidator();

  const [userBucket, setUserBucket] = React.useState("");
  const [bucketErrorMessage, setBucketErrorMessage] = React.useState("");
  const [showBucketInput, setShowBucketInput] = React.useState(false);
  const [activeBucket, setActiveBucket] = React.useState();

  function handleAddBucket() {
    if (userBucket !== "") {
      addBucket(userBucket).then(() => revalidator.revalidate());
      setUserBucket("");
      setBucketErrorMessage("");
    } else {
      setBucketErrorMessage("Bucket must have a name");
    }
  }

  function handleUpdateBucket(bucket) {
    setUserBucket(bucket);
    setActiveBucket(bucket);
    setShowBucketInput(true);
    if (activeBucket === bucket && showBucketInput) {
      updateBucket(bucket, userBucket).then(() => revalidator.revalidate());
    }
  }

  function handleDeletion(bucket) {
    if (
      window.confirm(
        "Are you sure you want to delete this bucket? This will remove it from all cards. Do you wish to continue?",
      )
    ) {
      deleteBucket(bucket).then(() => revalidator.revalidate());
    }
  }

  const bucketElements = buckets.map((bucket) => {
    return (
      <div
        key={bucket}
        className="flex-row space-between padding-inline padding-block border"
      >
        {activeBucket === bucket ? (
          <>
            {!showBucketInput ? (
              <p>{bucket}</p>
            ) : (
              <input
                onChange={(e) => setUserBucket(e.currentTarget.value)}
                defaultValue={userBucket}
              />
            )}
          </>
        ) : (
          <p>{bucket}</p>
        )}
        <div className="flex-row gap-lg">
          <button onClick={() => handleUpdateBucket(bucket)}>
            {showBucketInput && activeBucket === bucket ? "Confirm" : "Rename"}
          </button>
          <button className="btn-red" onClick={() => handleDeletion(bucket)}>
            Delete
          </button>
        </div>
      </div>
    );
  });

  return (
    <div className="margin-inline">
      <div className="page-heading flex-col align-left">
        <div className="flex-row gap-lg align-center padding-top">
          <Link to={`/account`} className="link-btn">
            &larr; Account
          </Link>
          &gt;
          <p className="italic">Manage Buckets</p>
        </div>
        <div className="margin-bottom margin-top">
          <h1 className="margin-none">Manage Buckets</h1>
          <p>Organise your notes into themed categories</p>
        </div>
      </div>

      {bucketErrorMessage && (
        <p className="red margin-top">{bucketErrorMessage}</p>
      )}
      <div className="flex-row gap-lg margin-block">
        <input
          onChange={(e) => setUserBucket(e.currentTarget.value)}
          placeholder="New bucket name..."
        />
        <button onClick={handleAddBucket}>Add bucket</button>
      </div>
      <div className="card card-red">
        <div className="flex-row space-between">
          <p>Your Buckets</p>
          <p>{buckets.length} buckets</p>
        </div>
        <div className="manage-buckets">{bucketElements}</div>
      </div>
    </div>
  );
}
