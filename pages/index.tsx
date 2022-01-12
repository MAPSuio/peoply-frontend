import type { NextPage } from "next";
import Link from "next/link";
import Header from "../components/Header";

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <h1>Peoply app</h1>
      <Link href="/login">Login page</Link>
    </div>
  );
};

export default Home;
