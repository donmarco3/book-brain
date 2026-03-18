import React from "react";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { addNote, getBook } from "../api";

export function loader({ params }) {
  return getBook(params.id);
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const title = formData.get("note-title");
  const page = formData.get("book-page");
  const context = formData.get("note-context");
  const capture = formData.get("note-capture");
  const spark = formData.get("note-spark");
  const book = await getBook(params.id);
  addNote({ title, page, context, capture, spark }, book);
  return redirect(`/book/${book.id}/inbox`);
}

export default function Log() {
  const book = useLoaderData();

  return (
    <>
      <Link to="/bookshelf">&larr; Back to bookshelf</Link>
      <h1>Log Notes</h1>
      <p>
        {book.title} by {book.author}
      </p>
      <Form method="post" className="log-note-form" replace>
        <h2>New Note</h2>
        <label htmlFor="note-title">Title</label>
        <input id="note-title" name="note-title" placeholder="Note title" />
        <label htmlFor="book-page">Page</label>
        <input
          id="book-page"
          name="book-page"
          type="number"
          placeholder="e.g. 42"
        />
        <label htmlFor="note-context">Context</label>
        <textarea
          id="note-context"
          name="note-context"
          placeholder="Summarise the key idea in your own words..."
        ></textarea>
        <label htmlFor="note-capture">Capture (passage from the book)</label>
        <textarea
          id="note-capture"
          name="note-capture"
          placeholder="Copy a quote or passage from the book..."
        ></textarea>
        <label htmlFor="note-spark">Spark (your thought/reaction)</label>
        <textarea
          id="note-spark"
          name="note-spark"
          placeholder="What does this make you think? Any connections or reactions?"
        ></textarea>
        <button>Save Note</button>
      </Form>
    </>
  );
}
