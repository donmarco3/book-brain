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
      <div className="log-header">
        <Link to="/bookshelf" className="link-btn">
          &larr; Back to Bookshelf
        </Link>
        <h1>Log Notes</h1>
        <p>
          {book.title} by {book.author}
        </p>
      </div>

      <Form method="post" className="log-note-form" replace>
        <h2>New Note</h2>
        <div className="log-note-form-header">
          <div>
            <label htmlFor="note-title">
              Title <span className="required-field">*</span>
            </label>
            <input id="note-title" name="note-title" placeholder="Note title" />
          </div>
          <div>
            <label htmlFor="book-page">
              Page <span className="required-field">*</span>
            </label>
            <input
              id="book-page"
              name="book-page"
              type="number"
              placeholder="e.g. 42"
            />
          </div>
        </div>
        <label htmlFor="note-context">
          Context <span className="required-field">*</span>
        </label>
        <textarea
          id="note-context"
          name="note-context"
          placeholder="Summarise the key idea in your own words..."
          rows={3}
        ></textarea>
        <label htmlFor="note-capture">
          Capture (passage from the book){" "}
          <span className="required-field">*</span>
        </label>
        <textarea
          id="note-capture"
          name="note-capture"
          placeholder="Copy a quote or passage from the book..."
          rows={3}
        ></textarea>
        <label htmlFor="note-spark">
          Spark (your thought/reaction){" "}
          <span className="required-field">*</span>
        </label>
        <textarea
          id="note-spark"
          name="note-spark"
          placeholder="What does this make you think? Any connections or reactions?"
          rows={3}
        ></textarea>
        <div className="log-note-buttons">
          <button className="btn-dark btn-lg">Save Note</button>
        </div>
      </Form>
    </>
  );
}
