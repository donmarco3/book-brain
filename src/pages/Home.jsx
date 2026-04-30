import React from "react";
import { getAllBooks, getAllNotes } from "../api";
import { Link, useLoaderData } from "react-router";
import { sliceString } from "../utils";
import { FaPenNib } from "react-icons/fa";
import Pill from "../components/Pill";

export async function loader() {
  const books = await getAllBooks();
  const notes = await getAllNotes();
  return { books, notes };
}

export default function Home() {
  const { books, notes } = useLoaderData();

  const [selectedPeriod, setSelectedPeriod] = React.useState("Month");

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

  function getNumberOfNotes() {
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
              Add another book from the library page.
            </p>
          </div>
          <Link to="/library" className="link-btn link-btn-dark">
            Library
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
              Add your first book from the library page.
            </p>
          </div>
          <Link to="/library" className="link-btn link-btn-dark">
            Library
          </Link>
        </div>
      );
    } else {
      return books.map((book) => {
        if (book.status === "reading") {
          return (
            <div key={book.id}>
              <div>
                <h3 className="card-title">{book.title}</h3>
                <p className="text-sm italic">{book.author}</p>
              </div>
            </div>
          );
        }
      });
    }
  }

  function getRandomNote() {
    let sum = 0;
    for (let i = 0; i < formattedDate.length; i++) {
      sum += formattedDate.charCodeAt(i);
    }

    const randomIndex = sum % notes.length;
    const bucketElements = notes[randomIndex].buckets.map((bucket) => (
      <p key={bucket.id} className="pill">
        {bucket.name}
      </p>
    ));

    const book = books.find((book) => book.id === notes[randomIndex].book_id);

    return (
      <Link
        to={`/note/${notes[randomIndex].id}`}
        state={{ from: "/" }}
        className="link"
      >
        <div className="card main-card" key={notes[randomIndex].id}>
          <div className="icon-pill gold">
            <FaPenNib />
            <h3>Note from your library</h3>
          </div>
          <div className="main-card-header">
            <h3 className="card-title">{notes[randomIndex].note_title}</h3>
          </div>

          <div className="main-card-text">
            <p className="italic capture">
              "{sliceString(notes[randomIndex].capture)}"
            </p>
            <div>
              <p>{sliceString(notes[randomIndex].spark)}</p>
            </div>
            <p>
              {book.title} &middot; {book.author} &middot; logged 3 days ago
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="margin-inline">
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p>
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="home-stats container">
        <div className="card">
          <h3>Books Read</h3>
          <p className="number">{books.length}</p>
          <p className="italic">this year</p>
        </div>
        <div className="card">
          <h3>Notes Logged</h3>
          <p className="number">{notes.length}</p>
          <p className="italic">{getNumberOfNotes()} this month</p>
        </div>
        <div className="card">
          <h3>This Week</h3>
          <p className="number">{getNumberOfNotes()}</p>
          <p className="italic">notes logged</p>
        </div>
        <div className="card">
          <h3>Current Streak</h3>
          <p className="number gold">{getStreak()}</p>
          <p className="italic">days</p>
        </div>
      </div>

      <div className="currently-reading container">
        <div className="card">
          <div>
            <h3>Currently Reading</h3>
          </div>
          <div>{getCurrentlyReading()}</div>
        </div>
        <div className="card">
          <div>
            <h3>Reading Streak</h3>
          </div>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="container">{getRandomNote()}</div>
      ) : null}
    </div>
  );
}
