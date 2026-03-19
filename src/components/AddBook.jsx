import React from "react";
import { Form } from "react-router";
import { addBook } from "../api";

export async function action({ request }) {
  const formData = await request.formData();
  addBook(formData.get("book-title"), formData.get("book-author"));
}

export default function AddBook({ action, showModal, setShowModal }) {
  return (
    <>
      {showModal ? (
        <div className="add-book-modal-overlay">
          <div className="add-book-modal">
            <Form
              method="post"
              action={action}
              className="add-book-form"
              replace
            >
              <h2>Add a Book</h2>
              <div className="add-book-modal-inputs">
                <label htmlFor="book-title">
                  Title <span className="required-field">*</span>
                </label>
                <input
                  id="book-title"
                  name="book-title"
                  placeholder="Enter book title"
                  autoFocus
                />
                <label htmlFor="book-author">
                  Author <span className="required-field">*</span>
                </label>
                <input
                  id="book-author"
                  name="book-author"
                  placeholder="Enter author name"
                />
              </div>

              <div className="add-book-modal-buttons">
                <button className="btn-lg" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn-dark btn-lg">Add Book</button>
              </div>
            </Form>
          </div>
        </div>
      ) : null}
    </>
  );
}
