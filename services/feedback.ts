import { fetchFromPeoplyApiJson } from "./fetchers";

export async function createFeedback(message: string) {
  return fetchFromPeoplyApiJson("/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ message }),
  });
}
