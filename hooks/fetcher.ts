const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(`${process.env.API_URL}${input}`, {
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    throw new Error(`${res.status}, ` + res.statusText);
  }

  return res.json();
};

export default fetcher;
