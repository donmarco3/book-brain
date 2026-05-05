import React from "react";
import { getAllBooks, getAllNotes, getReadingActivity } from "../api";
import { Link, useLoaderData } from "react-router";
import {
  calculateProgress,
  formatDateToRoman,
  getDaysAgo,
  sliceString,
} from "../utils";
import { FaPenNib } from "react-icons/fa";
import ProgressBar from "../components/ProgressBar";
import BookCover from "../components/BookCover";

export async function loader() {
  const books = await getAllBooks();
  const notes = await getAllNotes();
  const readingActivity = await getReadingActivity();
  return { books, notes, readingActivity };
}

export default function Home() {
  const { books, notes, readingActivity } = useLoaderData();

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

  function getNumberOfNotesMonth() {
    const now = new Date();
    let cutoffDate;

    cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - 30);
    return notes.filter((note) => new Date(note.created_at) >= cutoffDate)
      .length;
  }

  function getNumberOfNotesWeek() {
    const now = new Date();
    let cutoffDate;

    cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - 7);
    return notes.filter((note) => new Date(note.created_at) >= cutoffDate)
      .length;
  }

  function getCurrentlyReading() {
    if (books.every((book) => book.status === "read")) {
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
      const booksArr = books.filter((book) => book.status === "reading");
      return booksArr.slice(0, 3).map((book) => {
        if (book.status === "reading") {
          return (
            <Link
              to={`/library/book/${book.id}`}
              key={book.id}
              className="flex-row margin-block"
            >
              <BookCover image={book.image} size="sm" />

              <div className="padding-inline book-info">
                <div className="flex-col">
                  <p>{book.title}</p>
                  <p className="italic">{book.author}</p>
                </div>
                <div className="flex-col progress">
                  <p>Progress</p>
                  <ProgressBar
                    progress={calculateProgress(book.progress, book.pages)}
                  />
                  <p>
                    {calculateProgress(book.progress, book.pages)}% &middot; p.{" "}
                    {book.progress} of {book.pages}
                  </p>
                </div>
              </div>
            </Link>
          );
        }
      });
    }
  }

  function getReadingStreak() {
    const squareElements = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      let newDate = new Date(today);
      newDate.setDate(today.getDate() - i);

      if (i === 0) {
        squareElements.push(<div key={i} className="square square-gold"></div>);
      } else {
        if (readingActivity.length === 0) {
          squareElements.push(
            <div key={i} className="square square-white"></div>,
          );
        } else {
          if (
            readingActivity.some(
              (row) =>
                new Date(row.created_at).toDateString() !==
                newDate.toDateString(),
            )
          ) {
            squareElements.push(
              <div key={i} className="square square-white"></div>,
            );
          } else {
            squareElements.push(
              <div key={i} className="square square-red"></div>,
            );
          }
        }
      }
    }
    return squareElements;
  }

  function getRandomNote() {
    let sum = 0;
    for (let i = 0; i < formattedDate.length; i++) {
      sum += formattedDate.charCodeAt(i);
    }

    const randomIndex = sum % notes.length;

    const book = books.find((book) => book.id === notes[randomIndex].book_id);

    return (
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
          <p className="italic">
            {book.title} &middot; {book.author} &middot; logged{" "}
            {getDaysAgo(notes[randomIndex].created_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="margin-inline">
      <div className="page-heading space-between align-center">
        <h1>Dashboard</h1>
        <span>{formatDateToRoman()}</span>
      </div>
      <div className="home-stats margin-block">
        <div className="card">
          <h3>Books Read</h3>
          <p className="number">
            {books.filter((book) => book.status === "read").length}
          </p>
          <p className="italic">this year</p>
        </div>
        <div className="card">
          <h3>Notes Logged</h3>
          <p className="number">{notes.length}</p>
          <p className="italic">{getNumberOfNotesMonth()} this month</p>
        </div>
        <div className="card">
          <h3>This Week</h3>
          <p className="number">{getNumberOfNotesWeek()}</p>
          <p className="italic">notes logged</p>
        </div>
        <div className="card">
          <h3>Current Streak</h3>
          <p className="number gold">{getStreak()}</p>
          <p className="italic">days</p>
        </div>
      </div>

      <div className="currently-reading flex-row gap-lg margin-block">
        <div className="card card-red">
          <div>
            <h3>Currently Reading</h3>
          </div>
          <div className="padding-inline">{getCurrentlyReading()}</div>
        </div>
        <div className="card card-red">
          <div>
            <h3>Reading Streak</h3>
          </div>
          <div className="padding-inline padding-block">
            <p>Past 30 days</p>
            <div className="flex-row gap-lg wrap margin-block">
              {getReadingStreak()}
            </div>
            <div className="flex-row gap-lg">
              <div className="flex-row gap-lg align-center">
                <div className="square-sm square-red"></div>
                <p>Read</p>
              </div>
              <div className="flex-row gap-lg align-center">
                <div className="square-sm square-gold"></div>
                <p>Today</p>
              </div>
              <div className="flex-row gap-lg align-center">
                <div className="square-sm square-white"></div>
                <p>Missed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="margin-block">{getRandomNote()}</div>
      ) : null}
    </div>
  );
}
