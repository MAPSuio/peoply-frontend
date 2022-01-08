/* will request the backend to remove auth cookies from clienty */
export function logout() {
  const url = `${process.env.API_URL}/auth/logout`;
  fetch(url, { method: "GET", credentials: "include" });
}
