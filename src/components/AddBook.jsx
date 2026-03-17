import React from "react";
import { Form } from "react-router";
import { addBook } from "../api";

export async function action({ request }) {
  const formData = await request.formData();
  addBook(formData.get("book-title"), formData.get("book-author"));
}

export default function AddBook({ action }) {
  return (
    <Form method="post" action={action} className="add-book-form" replace>
      <label htmlFor="book-title">Title</label>
      <input id="book-title" name="book-title" placeholder="Book Title" />
      <label htmlFor="book-author">Author</label>
      <input id="book-author" name="book-author" placeholder="Author" />
      <button>Add Book</button>
    </Form>
  );
}
