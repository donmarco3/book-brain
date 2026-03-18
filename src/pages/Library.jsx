import React from "react";
import { getBuckets, getCards } from "../api";
import { useLoaderData } from "react-router";

export async function loader() {
  const cards = await getCards();
  const buckets = await getBuckets();
  return { cards, buckets };
}

export default function Library() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const { cards, buckets } = useLoaderData();

  function toggleBucket(name) {
    if (selectedBuckets.includes(name)) {
      setSelectedBuckets(selectedBuckets.filter((bucket) => bucket !== name));
    } else {
      setSelectedBuckets([...selectedBuckets, name]);
    }
  }

  // const filteredCards = cards.filter((card) => {
  //   console.log(card.buckets);
  //   const filteredBuckets = card.buckets.some((bucket) =>
  //     selectedBuckets.includes(bucket),
  //   );

  //   if (searchQuery.toLowerCase() === "" && selectedBuckets.length === 0) {
  //     return card;
  //   } else if (searchQuery.toLowerCase()) {
  //     return (
  //       card.noteTitle.toLowerCase().includes(searchQuery) ||
  //       card.bookTitle.toLowerCase().includes(searchQuery) ||
  //       card.context.toLowerCase().includes(searchQuery) ||
  //       card.capture.toLowerCase().includes(searchQuery) ||
  //       card.spark.toLowerCase().includes(searchQuery) ||
  //       card.question1.toLowerCase().includes(searchQuery) ||
  //       card.question2.toLowerCase().includes(searchQuery)
  //     );
  //   } else if (selectedBuckets.length > 0) {
  //     return card.filteredBuckets
  //   }
  // });

  const cardElements = filteredCards.map((card) => {
    return (
      <div className="card" key={card.id}>
        <p>{card.noteTitle}</p>
        <p>{card.bookTitle}</p>
        <p>{card.page}</p>
        <p>{card.context}</p>
        <p>{card.capture}</p>
        <p>{card.spark}</p>
        <p>{card.question1}</p>
        <p>{card.question2}</p>
      </div>
    );
  });

  const bucketElements = buckets.map((bucket) => {
    return (
      <button
        className={
          selectedBuckets.includes(bucket.name) ? "bucket selected" : "bucket"
        }
        key={bucket.id}
        onClick={() => toggleBucket(bucket.name)}
      >
        {bucket.name}
      </button>
    );
  });

  return (
    <>
      <h1>Library</h1>
      <label htmlFor="search-query">Search</label>
      <input
        id="search-query"
        name="search-query"
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />
      {bucketElements}
      {cardElements}
    </>
  );
}
