const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    throw new Error(`${res.status}, ` + res.statusText);
  }

  return res.json();
};

export default fetcher;
