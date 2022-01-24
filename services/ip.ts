export async function fetchIpInfo() {
  const url = "https://ipapi.co/json/";
  const response = await fetch(url);
  const data = await response.json();

  if (response.ok) return data;
}
