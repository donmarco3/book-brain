import React from "react";
import { Form, redirect, useActionData } from "react-router";
import { addBook } from "../api";
import useClickOutside from "./hooks/useClickOutside";

export async function action({ request }) {
  const formData = await request.formData();
  const title = formData.get("book-title");
  const author = formData.get("book-author");

  if (!title || !author) {
    return { error: "Must include title and author" };
  }

  try {
    await addBook(title, author);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export default function AddBook({ action, showModal, setShowModal }) {
  const actionData = useActionData();
  const [errorMessage, setErrorMessage] = React.useState("");
  const modalRef = React.useRef(null);

  React.useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
    } else {
      setShowModal(false);
    }
  }, [actionData]);

  useClickOutside(modalRef, () => setShowModal(false));

  return (
    <>
      {showModal ? (
        <div className="modal-overlay">
          <div className="add-book-modal" ref={modalRef}>
            <Form
              method="post"
              action={action}
              className="add-book-form"
              replace
            >
              <h2>Add a Book</h2>
              {errorMessage && <p className="red">{errorMessage}</p>}
              <div className="add-book-modal-inputs">
                <label htmlFor="book-title" className="bold">
                  Title <span className="required-field">*</span>
                </label>
                <input
                  id="book-title"
                  name="book-title"
                  placeholder="Enter book title"
                  autoFocus
                />
                <label htmlFor="book-author" className="bold">
                  Author <span className="required-field">*</span>
                </label>
                <input
                  id="book-author"
                  name="book-author"
                  placeholder="Enter author name"
                />
              </div>

              <div className="add-book-modal-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrorMessage("");
                  }}
                >
                  Cancel
                </button>
                <button className="btn-dark">Add Book</button>
              </div>
            </Form>
          </div>
        </div>
      ) : null}
    </>
  );
}
