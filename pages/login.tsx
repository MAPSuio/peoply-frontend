import type { NextPage } from "next";
import useUser from "../hooks/useUser";
import { useRouter } from "next/router";
import { useSWRConfig } from "swr";
import Link from "next/link";

const Login: NextPage = () => {
  const { user, mutate, logout, isError } = useUser();
  const router = useRouter();
  const { cache } = useSWRConfig();

  console.log("cache: ", cache);

  const logoutHandler = () => {
    logout();
    mutate();
    router.reload();
  };

  if (user)
    return (
      <div>
        <h2>Already logged in</h2>
        <button onClick={logoutHandler}>Log out</button>
      </div>
    );

  return (
    <div>
      <main>
        <h1>Logg inn med Vipps</h1>
      </main>

      <Link href="/">hello page</Link>
      <button>
        <a onClick={mutate} href="http://localhost:3000/auth/login">
          {" "}
          Log inn med Vipps
        </a>
      </button>
    </div>
  );
};

export default Login;
