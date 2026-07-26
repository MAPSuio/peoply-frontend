import { useEffect, useState } from "react";

/**
 * Live countdown to an event's registration opening, ticking once a second.
 * `isCountdown` is `undefined` until the first tick decides whether `regStart`
 * is still in the future - JoinButton uses that to keep the button in a
 * loading state rather than flashing "closed" before the first tick runs.
 */
export default function useRegistrationCountdown(
  regStart?: Date | string | null,
) {
  const [countdown, setCountdown] = useState<string>();
  const [isCountdown, setIsCountdown] = useState<boolean>();

  useEffect(() => {
    const int = setInterval(() => {
      const now = new Date();
      const start = regStart && new Date(regStart);

      if (start && start > now) {
        setIsCountdown(true);
        const diff = start.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown(
          `${days ? days + "d " : ""} ${hours ? hours + "t " : ""} ${
            minutes ? minutes + "m " : ""
          } ${days === 0 ? seconds + "s" : ""}`,
        );
      } else {
        setIsCountdown(false);
        setCountdown(undefined);

        // clear the interval when the countdown is over
        clearInterval(int);
      }
    }, 1000);
    return () => clearInterval(int);
  }, [regStart]);

  return { countdown, isCountdown };
}
