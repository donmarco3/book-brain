import React from "react";
import { getAllNotes, getBooks, getCards } from "../api";
import { Link, useLoaderData } from "react-router";
import AddBook from "../components/AddBook";
import { sliceString, validatePageRange } from "../utils";

export async function loader() {
  const books = await getBooks();
  const cards = await getCards();
  const notes = await getAllNotes();
  return { books, cards, notes };
}

export default function Home() {
  const { books, cards, notes } = useLoaderData();

  const [selectedPeriod, setSelectedPeriod] = React.useState("Week");
  const [showModal, setShowModal] = React.useState(false);

  let streak = 0;

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = year + month + day;

  const notesCreationDates = notes.map((note) =>
    note.createdAt.toDate().toDateString(),
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
    return cards.filter((card) => card.createdAt.toDate() >= cutoffDate).length;
  }

  const bookElements = books.map((book) => {
    if (book.status === "Reading") {
      return (
        <div className="card" key={book.id}>
          <p className="nice-font card-title">{book.title}</p>
          <p className="text-sm">by {book.author}</p>
          <Link
            to={`/book/${book.id}/log`}
            state={{ from: "/" }}
            className="link-btn link-btn-dark"
          >
            Log Notes
          </Link>
        </div>
      );
    }
  });

  function getRandomCard() {
    let sum = 0;
    for (let i = 0; i < formattedDate.length; i++) {
      sum += formattedDate.charCodeAt(i);
    }

    const randomIndex = sum % cards.length;
    const bucketElements = cards[randomIndex].buckets.map((bucket) => (
      <p key={bucket} className="pill">
        {bucket}
      </p>
    ));

    return (
      <div className="card main-card" key={cards[randomIndex].id}>
        <Link to={`/card/${cards[randomIndex].id}`} className="link">
          <div className="main-card-header">
            <p className="nice-font card-title">
              {cards[randomIndex].noteTitle}
            </p>
            <div>
              <p>{cards[randomIndex].bookTitle}</p>
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
        </Link>
      </div>
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
            {getNumberOfCards() === 1 ? "Card" : "Cards"} This {selectedPeriod}
          </p>
        </div>
      </div>

      <h2 className="home-heading">Currently Reading</h2>
      <div className="currently-reading">
        {bookElements.length > 0 ? (
          <div>{bookElements}</div>
        ) : (
          <div className="no-items-container">
            <p className="text-sm no-items-text">
              You are currently reading no books.
            </p>
            <button
              className="btn-dark btn-lg"
              onClick={() => setShowModal(true)}
            >
              + Add Book
            </button>
            <AddBook
              action={"/bookshelf"}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          </div>
        )}
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
