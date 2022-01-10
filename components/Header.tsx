import type { NextPage } from "next";
import { useRouter } from "next/router";
import useUser from "../hooks/useUser";
import User from "./User";

const Header: NextPage = () => {
  return (
    <div>
      <div>Peoply</div>
      <User />
    </div>
  );
};

export default Header;
