import React from "react";
import { Form, useActionData } from "react-router";
import { updateBook, updateReadingActivity } from "../api";
import useClickOutside from "./hooks/useClickOutside";

export async function action({ request }) {
  const formData = await request.formData();
  const progress = formData.get("current-page");
  const pages = formData.get("total-pages");
  const id = formData.get("id");
  const title = formData.get("title");
  const author = formData.get("author");

  if (progress < 0) {
    return { error: "Current page cannot be less than 0" };
  }
  if (pages < 1) {
    return { error: "Pages must be greater than 0" };
  }

  try {
    await updateReadingActivity(id, "progress-updated");
    await updateBook(id, title, author, pages, progress);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export default function UpdateProgress({
  action,
  showModal,
  setShowModal,
  book,
}) {
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
              <h2>Update Progress</h2>
              <p className="italic">{book.title}</p>
              {errorMessage && <p className="red">{errorMessage}</p>}
              <div className="add-book-modal-inputs">
                <label htmlFor="current-page" className="gold">
                  Current page
                </label>
                <input
                  id="current-page"
                  name="current-page"
                  placeholder="Current page..."
                  type="number"
                  defaultValue={book.progress}
                  autoFocus
                />
                <label htmlFor="total-pages" className="gold">
                  Total pages
                </label>
                <input
                  id="total-pages"
                  name="total-pages"
                  placeholder="Total pages..."
                  type="number"
                  defaultValue={book.pages}
                />
                <input type="hidden" name="id" value={book.id}></input>
                <input type="hidden" name="title" value={book.title}></input>
                <input type="hidden" name="author" value={book.author}></input>
              </div>

              <div className="note-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrorMessage("");
                  }}
                >
                  Cancel
                </button>
                <button className="btn-dark">Update Progress</button>
              </div>
            </Form>
          </div>
        </div>
      ) : null}
    </>
  );
}
