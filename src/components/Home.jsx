import React from "react";

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <div className="home-stats">
        <div className="card">
          <p>0</p>
          <p>total books</p>
        </div>
        <div className="card">
          <p>0</p>
          <p>total cards</p>
        </div>
        <div className="card">
          <p>0 day</p>
          <p>streak</p>
        </div>
        <div className="card">
          <p>0</p>
          <p>cards this week</p>
        </div>
      </div>

      <br />

      <h2>Currently Reading</h2>
      <div className="currently-reading">
        <div className="card">
          <p>Book title</p>
          <p>Log notes</p>
          <p>inbox</p>
        </div>
      </div>
    </>
  );
}
