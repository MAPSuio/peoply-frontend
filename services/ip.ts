export async function fetchIpInfo() {
  const url = "https://ipapi.co/json/";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
