import { type Dispatch, type SetStateAction, useState } from "react";

export default function useLatchedValidity(
  satisfied: boolean,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [valid, setValid] = useState(false);

  if (!valid && satisfied) {
    setValid(true);
  }

  return [valid, setValid];
}
