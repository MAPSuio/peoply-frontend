import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <h1>Peoply app</h1>
      <Link href="/login">Login page</Link>
    </div>
  );
};

export default Home;
