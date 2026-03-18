import React from "react";
import { getAllNotes, getBooks, getCards } from "../api";
import { Link, useLoaderData } from "react-router";

export async function loader() {
  const books = await getBooks();
  const cards = await getCards();
  const notes = await getAllNotes();
  return { books, cards, notes };
}

export default function Home() {
  const { books, cards, notes } = useLoaderData();
  const [selectedPeriod, setSelectedPeriod] = React.useState("week");

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

    if (selectedPeriod === "week") {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod === "month") {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 30);
    } else if (selectedPeriod === "year") {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 365);
    }
    return cards.filter((card) => card.createdAt.toDate() >= cutoffDate).length;
  }

  const bookElements = books.map((book) => {
    if (book.status === "Reading") {
      return (
        <div className="card" key={book.id}>
          <p>{book.title}</p>
          <Link to={`/book/${book.id}/log`}>Log Notes</Link>
          <Link to={`/book/${book.id}/inbox`}>Inbox</Link>
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
    return (
      <div className="card" key={cards[randomIndex].id}>
        <Link to={`/card/${cards[randomIndex].id}`}>
          <p>{cards[randomIndex].noteTitle}</p>
          <p>{cards[randomIndex].bookTitle}</p>
          <p>{cards[randomIndex].buckets}</p>
          {cards[randomIndex].spark ? (
            <p>{cards[randomIndex].spark.slice(0, 300)}</p>
          ) : (
            <p>{cards[randomIndex].capture.slice(0, 300)}</p>
          )}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1>Home</h1>
      <div className="home-stats">
        <div className="card">
          <p>{books.length}</p>
          <p>total books</p>
        </div>
        <div className="card">
          <p>{cards.length}</p>
          <p>total cards</p>
        </div>
        <div className="card">
          <p>{getStreak()}</p>
          <p>streak</p>
        </div>
        <div className="card">
          <p>{getNumberOfCards()}</p>
          <button
            className={selectedPeriod === "week" ? "selected" : null}
            onClick={() => setSelectedPeriod("week")}
          >
            Week
          </button>
          <button
            className={selectedPeriod === "month" ? "selected" : null}
            onClick={() => setSelectedPeriod("month")}
          >
            Month
          </button>
          <button
            className={selectedPeriod === "year" ? "selected" : null}
            onClick={() => setSelectedPeriod("year")}
          >
            Year
          </button>
          <p>cards this week</p>
        </div>
      </div>

      <h2>Currently Reading</h2>
      <div className="currently-reading">{bookElements}</div>

      {cards.length > 0 ? (
        <div>
          <h2>Daily random card</h2>
          {getRandomCard()}
        </div>
      ) : null}
    </>
  );
}
