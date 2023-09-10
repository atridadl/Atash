"use client";

import Link from "next/link";

const VoteUI = () => {
  return (
    <span className="text-center">
      <h1 className="text-5xl font-bold m-2">4️⃣0️⃣4️⃣</h1>
      <h1 className="text-5xl font-bold m-2">
        Oops! This room does not appear to exist, or may have been deleted! 😢
      </h1>
      <Link
        about="Back to home."
        href="/"
        className="btn btn-secondary normal-case text-xl m-2"
      >
        Back to Home
      </Link>
    </span>
  );
};

export default VoteUI;
