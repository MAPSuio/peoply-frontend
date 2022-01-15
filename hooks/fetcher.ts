const fetcher = async (input: RequestInfo, init: RequestInit) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
      credentials: "include",
      ...init,
    });

    return res.json();
  } catch (error) {
    throw new Error("Something went wrong, error: " + error);
  }
};

export default fetcher;
