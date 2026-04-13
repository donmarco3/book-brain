import React from "react";
import { getAllNotes, getBooks, getBuckets, getCards } from "../api";
import { Link, useLoaderData } from "react-router";
import { sliceString } from "../utils";

export async function loader() {
  const books = await getBooks();
  const cards = await getCards();
  const notes = await getAllNotes();
  return { books, cards, notes };
}

export default function Home() {
  const { books, cards, notes } = useLoaderData();

  const [selectedPeriod, setSelectedPeriod] = React.useState("Week");

  let streak = 0;

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = year + month + day;

  const notesCreationDates = notes.map((note) =>
    new Date(note.created_at).toDateString(),
  );
  const uniqueDates = [...new Set(notesCreationDates)];

  function getStreak() {
    if (uniqueDates.includes(currentDate.toDateString())) {
      streak++;
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
      if (uniqueDates.includes(currentDate.toDateString())) {
        streak++;
      }
      return streak;
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (uniqueDates.includes(currentDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function getNumberOfCards() {
    const now = new Date();
    let cutoffDate;

    if (selectedPeriod === "Week") {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod === "Month") {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 30);
    } else if (selectedPeriod === "Year") {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 365);
    }
    return notes.filter((note) => new Date(note.created_at) >= cutoffDate)
      .length;
  }

  function getCurrentlyReading() {
    if (books.every((book) => book.status === "finished")) {
      return (
        <div className="no-items-container">
          <div>
            <p className="text-sm no-items-text">
              You are currently reading no books.
            </p>
            <p className="text-sm no-items-text">
              Add another book from the bookshelf page.
            </p>
          </div>
          <Link to="/bookshelf" className="link-btn link-btn-dark">
            Bookshelf
          </Link>
        </div>
      );
    } else if (books.length === 0) {
      return (
        <div className="no-items-container">
          <div>
            <p className="text-sm no-items-text">
              You are currently reading no books.
            </p>
            <p className="text-sm no-items-text">
              Add your first book from the bookshelf page.
            </p>
          </div>
          <Link to="/bookshelf" className="link-btn link-btn-dark">
            Bookshelf
          </Link>
        </div>
      );
    } else {
      return books.map((book) => {
        if (book.status === "reading") {
          return (
            <div className="card no-items-container" key={book.id}>
              <div>
                <p className="nice-font card-title">{book.title}</p>
                <p className="text-sm">by {book.author}</p>
              </div>
              <Link
                to={`/book/${book.id}/log`}
                className="link-btn link-btn-dark"
              >
                Log Notes
              </Link>
            </div>
          );
        }
      });
    }
  }

  function getRandomCard() {
    let sum = 0;
    for (let i = 0; i < formattedDate.length; i++) {
      sum += formattedDate.charCodeAt(i);
    }

    const randomIndex = sum % cards.length;
    const bucketElements = cards[randomIndex].buckets.map((bucket) => (
      <p key={bucket.id} className="pill">
        {bucket.name}
      </p>
    ));

    const book = books.find((book) => book.id === cards[randomIndex].book_id);

    return (
      <Link
        to={`/card/${cards[randomIndex].id}`}
        state={{ from: "/" }}
        className="link"
      >
        <div className="card main-card" key={cards[randomIndex].id}>
          <div className="main-card-header">
            <p className="nice-font card-title">
              {cards[randomIndex].card_title}
            </p>
            <div>
              <p>{book.title}</p>
              <p>p. {cards[randomIndex].page}</p>
            </div>
          </div>

          <div className="main-card-buckets">{bucketElements}</div>

          <div className="main-card-text">
            <p>
              <span className="bold">Context:</span>{" "}
              {sliceString(cards[randomIndex].context)}
            </p>
            <p className="italic capture">
              {sliceString(cards[randomIndex].capture)}
            </p>
            <div className="pill">
              <p>{sliceString(cards[randomIndex].spark)}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <>
      <h1 className="home-heading">Home</h1>
      <div className="home-stats">
        <div className="card">
          <p className="nice-font text-lg">{books.length}</p>
          <p>Total Books</p>
        </div>
        <div className="card">
          <p className="nice-font text-lg">{cards.length}</p>
          <p>Total Cards</p>
        </div>
        <div className="card">
          <p className="nice-font text-lg">{getStreak()}</p>
          <p>Day Streak</p>
        </div>
        <div className="card">
          <p className="nice-font text-lg">{getNumberOfCards()}</p>
          <div>
            <button
              className={selectedPeriod === "Week" ? "btn-dark" : null}
              onClick={() => setSelectedPeriod("Week")}
            >
              Week
            </button>
            <button
              className={selectedPeriod === "Month" ? "btn-dark" : null}
              onClick={() => setSelectedPeriod("Month")}
            >
              Month
            </button>
            <button
              className={selectedPeriod === "Year" ? "btn-dark" : null}
              onClick={() => setSelectedPeriod("Year")}
            >
              Year
            </button>
          </div>
          <p>
            {getNumberOfCards() === 1 ? "Note" : "Notes"} This {selectedPeriod}
          </p>
        </div>
      </div>

      <h2 className="home-heading">Currently Reading</h2>
      <div className="currently-reading">
        <div className="currently-reading-books">{getCurrentlyReading()}</div>
      </div>

      <h2 className="home-heading">Daily Random Card</h2>
      {cards.length > 0 ? (
        <div>{getRandomCard()}</div>
      ) : (
        <p className="text-sm">
          No cards yet. Distill some notes to see your daily card.
        </p>
      )}
    </>
  );
}
