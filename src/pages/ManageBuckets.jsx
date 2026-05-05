import React from "react";
import { addBucket, deleteBucket, getBuckets, updateBucket } from "../api";
import { Link, useLoaderData, useRevalidator } from "react-router";
import Pill from "../components/Pill";

export async function loader() {
  const { buckets, data } = await getBuckets();
  return { buckets, data };
}

export default function ManageBuckets() {
  const { buckets, data } = useLoaderData();
  const revalidator = useRevalidator();
  const bucketInputRef = React.useRef(null);

  const [userBucket, setUserBucket] = React.useState("");
  const [bucketErrorMessage, setBucketErrorMessage] = React.useState("");
  const [showBucketInput, setShowBucketInput] = React.useState(false);
  const [activeBucket, setActiveBucket] = React.useState();
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setWindowWidth(window.innerWidth),
      );
  }, []);

  React.useEffect(() => {
    if (bucketInputRef.current) {
      bucketInputRef.current.focus();
    }
  }, [showBucketInput]);

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
    setUserBucket(bucket.name);
    setActiveBucket(bucket.name);
    setShowBucketInput(true);
    if (activeBucket === bucket.name && showBucketInput) {
      updateBucket(bucket.id, userBucket).then(() => revalidator.revalidate());
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

  const bucketElements = data.map((bucket) => {
    return (
      <div
        key={bucket.id}
        className="flex-row space-between padding-inline padding-block border"
      >
        {activeBucket === bucket.name ? (
          <>
            {!showBucketInput ? (
              <p>{bucket.name}</p>
            ) : (
              <input
                onChange={(e) => setUserBucket(e.currentTarget.value)}
                defaultValue={userBucket}
                ref={bucketInputRef}
              />
            )}
          </>
        ) : (
          <p>{bucket.name}</p>
        )}
        <div className="flex-row gap-lg">
          <button onClick={() => handleUpdateBucket(bucket)}>
            {showBucketInput && activeBucket === bucket.name
              ? "Confirm"
              : "Rename"}
          </button>
          <button
            className="btn-red"
            onClick={() => handleDeletion(bucket.name)}
          >
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
      <div className={windowWidth >= 1500 ? "width-50" : ""}>
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
    </div>
  );
}
