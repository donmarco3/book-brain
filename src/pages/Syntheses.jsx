import React from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { deleteSynthesis, getBook, getSyntheses } from "../api";
import { sliceString, splitOnNewLine } from "../utils";

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const sort = url.searchParams.get("sort") ?? "newest";

  const syntheses = await getSyntheses(params.id, page, sort);
  const book = await getBook(params.id);
  return { syntheses, book };
}

export default function Syntheses() {
  const { syntheses, book } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeSynthesis, setActiveSynthesis] = React.useState(syntheses[0]);

  React.useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setWindowWidth(window.innerWidth),
      );
  }, []);

  const defaultPage = searchParams.get("page") ?? "1";
  const currentPage = Number(defaultPage);
  const currentSort = searchParams.get("sort") ?? "newest";

  function updatePage(type) {
    if (type === "right") {
      setSearchParams({
        page: currentPage + 1,
        sort: currentSort,
      });
    } else {
      setSearchParams({
        page: currentPage - 1 === 0 ? 1 : currentPage - 1,
        sort: currentSort,
      });
    }
  }

  function updateSort(type) {
    if (type === "newest") {
      setSearchParams({ page: 1, sort: "newest" });
    } else {
      setSearchParams({ page: 1, sort: "oldest" });
    }
  }

  function handleDeletion() {
    if (window.confirm("Are you sure you want to delete this synthesis?")) {
      deleteSynthesis(card.id);
      revalidator.revalidate();
    }
  }

  // const creationDate = new Date(book.created_at).toLocaleDateString("en-US", {
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // });

  const synthesesElements = syntheses.map((synthesis) => {
    if (isExpanded && activeSynthesis === synthesis) {
      return (
        <div
          key={synthesis.id}
          className="card card-red margin-block cursor-pointer"
          onClick={() => {
            setActiveSynthesis(synthesis);
            setIsExpanded((prev) => !prev);
          }}
        >
          <div className="flex-row space-between align-center">
            <p>
              {synthesis.type} &middot;{" "}
              {new Date(synthesis.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
            </p>
          </div>
          <div className="padding-inline padding-block">
            {windowWidth <= 1500 ? (
              <>
                <div className="border"></div>
                {splitOnNewLine(synthesis.synthesis).map((section) => (
                  <p key={section} className="margin-top">
                    {section}
                  </p>
                ))}
              </>
            ) : (
              <p>{sliceString(synthesis.synthesis)}</p>
            )}
            <div className="flex-row space-between margin-top">
              <p className="italic">From {book.notes.length} notes</p>
              {windowWidth <= 1500 ? (
                <p className="italic">Collapse &uarr;</p>
              ) : (
                <p className="italic">Expand &rarr;</p>
              )}
            </div>
          </div>
          {windowWidth <= 1500 && (
            <div className="note-buttons margin-inline margin-bottom">
              <button onClick={handleDeletion} className="btn-red">
                Delete
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div
        key={synthesis.id}
        className="card card-red margin-block cursor-pointer"
        onClick={() => {
          setActiveSynthesis(synthesis);
          setIsExpanded(true);
        }}
      >
        <div className="flex-row space-between align-center">
          <p>
            {synthesis.type} &middot;{" "}
            {new Date(synthesis.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
          </p>
        </div>
        <div className="padding-inline padding-block">
          <p>{sliceString(synthesis.synthesis)}</p>
          <div className="flex-row space-between margin-top">
            <p className="italic">From {book.notes.length} notes</p>
            <p className="italic">
              Expand{" "}
              {windowWidth >= 1500 ? <span>&rarr;</span> : <span>&darr;</span>}
            </p>
          </div>
        </div>
      </div>
    );
  });

  return (
    <>
      <div className="page-heading flex-col align-left margin-inline">
        <div className="flex-row gap-lg align-center padding-top">
          <Link to={`/library/book/${book.id}`} className="link-btn">
            &larr; {book.title}
          </Link>
          &gt;
          <p className="italic">Syntheses</p>
        </div>
        <div className="margin-bottom margin-top">
          <h1 className="margin-none">Syntheses</h1>
          <p>
            {book.title} &middot; {book.author} &middot; {book.syntheses.length}{" "}
            syntheses
          </p>
        </div>
      </div>

      {windowWidth <= 1500 ? (
        <div className="padding-inline">
          {syntheses.length > 0 ? (
            <div>{synthesesElements}</div>
          ) : (
            <div className="no-items-container">
              {currentPage === 1 ? (
                <p>You have no syntheses for this book.</p>
              ) : null}
            </div>
          )}
          <div className="pagination">
            <button
              className="btn-transparent"
              onClick={() => updatePage("left")}
              disabled={currentPage === 1}
            >
              &larr;
            </button>
            <p>Page {currentPage}</p>
            <button
              className="btn-transparent"
              onClick={() => updatePage("right")}
              disabled={book.syntheses.length <= currentPage * 5}
            >
              &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-row">
          <div className="notes-col padding-inline">{synthesesElements}</div>
          <div className="notes-col padding-inline">
            <div className="heading">
              <p className="gold">
                {activeSynthesis.type} &middot;{" "}
                {new Date(activeSynthesis.created_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}{" "}
              </p>
              <p className="italic">
                From {book.syntheses.length} notes &middot; {book.title}{" "}
                &middot; {book.author}
              </p>
            </div>
            {splitOnNewLine(activeSynthesis.synthesis).map((section) => (
              <p key={section} className="margin-top">
                {section}
              </p>
            ))}
            <div className="note-buttons">
              <button onClick={handleDeletion} className="btn-red">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
